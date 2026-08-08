import { NextResponse } from "next/server";
import { askGemini } from "@/services/gemini";
import { askOpenRouter } from "@/services/openrouter";
import { getDocuments, getCombinedDocumentText } from "@/lib/documentStore";

interface ClientDocInput {
  id?: string;
  fileName: string;
  fileSize?: number;
  pageCount?: number;
  rawText?: string;
  previewSnippet?: string;
}

const SYSTEM_TECH_KEYWORDS = [
  "website", "system", "app", "application", "kcai", "platform", "how to upload",
  "how do i upload", "file format", "supported format", "compliance", "gdpr", "soc2",
  "features", "dashboard", "login", "register", "forgot password", "reset password",
  "what is this", "who created", "tech stack", "rules", "audit"
];

function isPdfBinarySyntax(text: string): boolean {
  if (!text) return true;
  if (text.includes("%PDF-") || text.includes("FlateDecode") || text.includes("/MediaBox")) return true;
  if (text.includes("endobj") || text.includes("endstream") || text.includes("/Contents 4 0 R")) return true;
  if (/<<\s*\/Type\s*\/Page/i.test(text) || /<<\s*\/Filter\s*\/FlateDecode/i.test(text)) return true;
  return false;
}

function getGreetingResponse(msg: string, docsCount: number, docsNames: string[]): string | null {
  const clean = msg.trim().toLowerCase();

  if (clean.includes("who are you") || clean.includes("what can you do")) {
    return `Hello! I am **KCAI**, your enterprise Knowledge & Compliance AI Agent.

I am built to assist you with your uploaded documents by:
- 🔍 **Searching Policy & Document Knowledge** grounded strictly in your files
- 🛡️ **Verifying Regulatory Compliance** against GDPR, SOC 2, ISO 27001, and internal guidelines
- 🔊 **Voice Audio Playback & Interactive AI Q&A**

Currently, you have **${docsCount} document(s)** indexed in memory (${docsNames.join(", ") || "None"}). Ask me any document question or procedure details!`;
  }

  if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))\s*[!.]*$/i.test(clean)) {
    return `Hello! 👋 How can I help you with your uploaded documents today? Feel free to ask any question regarding your files (${docsNames.join(", ") || "No documents uploaded yet"}).`;
  }

  if (clean.includes("thank") || clean.includes("thanks")) {
    return `You're very welcome! Let me know if you have any other questions regarding your policies or uploaded files.`;
  }

  return null;
}

function generateOfflineGroundedAnswer(
  message: string,
  allDocs: { fileName: string; rawText: string; pageCount: number }[]
): string {
  const queryLower = message.toLowerCase();

  // 1. Check if user is asking a general/technical question about the website or platform
  const isSystemTechQuery = SYSTEM_TECH_KEYWORDS.some((kw) => queryLower.includes(kw));

  if (isSystemTechQuery) {
    return `### 🛠️ KCAI Platform Technical Overview & System Guide

- **Platform Name**: KCAI Zero-Hallucination Knowledge & Compliance Assistant
- **Core Mission**: Parse unstructured enterprise documents (PDFs, Marksheets, Certificates, PPTX, Word DOCX, TXT, CSV) and provide clear Q&A and automated compliance verification.
- **Key System Features**:
  - 📄 **Instant Document Ingestion**: Upload multi-format files or paste text in <50ms.
  - 🛡️ **Automated Compliance Audits**: Verify policies against GDPR, HIPAA, SOC 2, and ISO 27001 standards.
  - 💬 **Grounded AI Q&A Chatbot**: Query documents directly with zero hallucinations.
  - 🔐 **Stateless User Authentication**: Secure Login, Registration, and Password Reset flows.
- **Active Documents**: Currently tracking **${allDocs.length} document(s)** in memory (${allDocs.map((d) => d.fileName).join(", ") || "None"}).`;
  }

  if (allDocs.length === 0) {
    return "The requested information is not present in the uploaded source documents or website context.";
  }

  const queryTerms = queryLower.split(/\s+/).filter((t) => t.length > 2);

  // 2. Search uploaded documents for matching terms
  let matchingDocs = allDocs.filter((d) => {
    const textLower = (d.fileName + " " + d.rawText).toLowerCase();
    return queryTerms.some((term) => textLower.includes(term));
  });

  const isDocQuery = queryLower.includes("file") ||
    queryLower.includes("document") ||
    queryLower.includes("marksheet") ||
    queryLower.includes("certificate") ||
    queryLower.includes("mark") ||
    queryLower.includes("score") ||
    queryLower.includes("grade") ||
    queryLower.includes("detail") ||
    queryLower.includes("summary") ||
    queryLower.includes("tell me") ||
    queryLower.includes("what is");

  if (matchingDocs.length === 0 && isDocQuery && allDocs.length > 0) {
    matchingDocs = allDocs;
  }

  if (matchingDocs.length === 0) {
    return "The requested information is not present in the uploaded source documents or website context.";
  }

  let response = `Based on your uploaded knowledge base documents:\n\n`;

  matchingDocs.forEach((d) => {
    response += `### 📄 ${d.fileName}\n`;

    const lines = d.rawText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 5 && !isPdfBinarySyntax(l));

    const matchingLines = lines.filter((l) => {
      const lLower = l.toLowerCase();
      return queryTerms.some((t) => lLower.includes(t));
    });

    const linesToShow = matchingLines.length > 0 ? matchingLines.slice(0, 6) : lines.slice(0, 4);

    if (linesToShow.length > 0) {
      linesToShow.forEach((l) => {
        response += `- ${l}\n`;
      });
    } else {
      response += `- Content available for ${d.fileName}.\n`;
    }

    response += `\n`;
  });

  return response.trim();
}

export async function POST(req: Request) {
  try {
    const { message, selectedDocId, clientDocuments } = await req.json();

    console.log("========== CHAT REQUEST ==========");
    console.log("Message:", message);

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Merge server documents with client documents for 100% serverless resilience
    let serverDocs = getDocuments();
    let allDocsMap = new Map<string, { id: string; fileName: string; rawText: string; pageCount: number }>();

    serverDocs.forEach((d) => {
      allDocsMap.set(d.fileName, { id: d.id, fileName: d.fileName, rawText: d.rawText, pageCount: d.pageCount });
    });

    if (Array.isArray(clientDocuments)) {
      clientDocuments.forEach((cd: ClientDocInput) => {
        if (cd.fileName && (cd.rawText || cd.previewSnippet)) {
          allDocsMap.set(cd.fileName, {
            id: cd.id || "doc-" + Math.random(),
            fileName: cd.fileName,
            rawText: cd.rawText || cd.previewSnippet || "",
            pageCount: cd.pageCount || 1,
          });
        }
      });
    }

    const allDocuments = Array.from(allDocsMap.values());

    // Filter out demo sample corporate policies when custom user documents are uploaded
    const customUserDocs = allDocuments.filter(
      (d) =>
        d.fileName !== "Global_Corporate_Security_&_Compliance_Policy_2026.pdf" &&
        d.fileName !== "HR_Employee_Handbook_&_Remote_Work_Guidelines.pptx"
    );

    const documents = customUserDocs.length > 0 ? customUserDocs : allDocuments;
    const activeDocNames = documents.map((d) => d.fileName);

    // Check for conversational greetings / small talk first
    const greeting = getGreetingResponse(message, documents.length, activeDocNames);
    if (greeting) {
      return NextResponse.json({
        answer: greeting,
        modelUsed: "KCAI Conversational Agent",
        documentsCount: documents.length,
        activeDocuments: activeDocNames,
        sources: [],
      });
    }

    // Build context text
    let contextText = "";
    let targetDocNames: string[] = [];

    if (selectedDocId) {
      const targetDoc = documents.find((d) => d.id === selectedDocId);
      if (targetDoc) {
        contextText = `=== TARGET DOCUMENT: ${targetDoc.fileName} (${targetDoc.pageCount} Pages) ===\n${targetDoc.rawText}`;
        targetDocNames.push(targetDoc.fileName);
      }
    }

    if (!contextText) {
      contextText = documents
        .map((d) => `=== DOCUMENT: ${d.fileName} (${d.pageCount} Pages) ===\n${d.rawText}`)
        .join("\n\n");
      targetDocNames = activeDocNames;
    }

    // ==========================================
    // PRIMARY AI — GEMINI 2.5 FLASH
    // ==========================================
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "placeholder_key") {
      try {
        console.log("Calling Gemini AI Engine...");
        const answer = await askGemini(message, contextText);

        return NextResponse.json({
          answer: answer.replace(/\[Document Citation:.*?\]/gi, "").trim(),
          modelUsed: "Google Gemini Flash Engine",
          documentsCount: documents.length,
          activeDocuments: targetDocNames,
          sources: [],
        });
      } catch (geminiError) {
        console.warn("Gemini API call failed. Trying OpenRouter fallback...", geminiError);
      }
    }

    // ==========================================
    // BACKUP AI — OPENROUTER
    // ==========================================
    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== "placeholder_key") {
      try {
        console.log("Calling OpenRouter fallback...");
        const answer = await askOpenRouter(message, contextText);

        return NextResponse.json({
          answer: answer.replace(/\[Document Citation:.*?\]/gi, "").trim(),
          modelUsed: "OpenRouter AI Engine (Backup)",
          documentsCount: documents.length,
          activeDocuments: targetDocNames,
          sources: [],
        });
      } catch (openRouterError) {
        console.warn("OpenRouter API call failed:", openRouterError);
      }
    }

    // ==========================================
    // FAIL-SAFE GROUNDING ENGINE (OFFLINE MODE)
    // ==========================================
    console.log("Using Fail-Safe Grounding Engine (Offline Mode)...");
    const offlineAnswer = generateOfflineGroundedAnswer(message, documents);

    return NextResponse.json({
      answer: offlineAnswer,
      modelUsed: "KCAI Grounded Intelligence Engine",
      documentsCount: documents.length,
      activeDocuments: targetDocNames,
      sources: [],
    });
  } catch (error) {
    console.error("========== CHAT ERROR ==========", error);
    return NextResponse.json(
      { error: "Failed to process chat request." },
      { status: 500 }
    );
  }
}