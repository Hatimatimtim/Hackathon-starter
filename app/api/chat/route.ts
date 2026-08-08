import { NextResponse } from "next/server";
import { askGemini } from "@/services/gemini";
import { askOpenRouter } from "@/services/openrouter";
import { getDocuments, getCombinedDocumentText, getAllDocumentChunks } from "@/lib/documentStore";

const GREETING_REGEX = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|who\s*are\s*you|what\s*can\s*you\s*do|help|thanks|thank\s*you)\s*[!.]*$/i;

function getGreetingResponse(msg: string, docsCount: number, docsNames: string[]): string | null {
  const clean = msg.trim().toLowerCase();

  if (clean.includes("who are you") || clean.includes("what can you do")) {
    return `Hello! I am **KCAI**, your enterprise Knowledge & Compliance AI Agent.

I am built to assist you with your uploaded documents by:
- 🔍 **Searching Policy & Document Knowledge** grounded strictly in your files
- 🛡️ **Verifying Regulatory Compliance** against GDPR, SOC 2, ISO 27001, and internal guidelines
- 📄 **Providing Exact Source Citations** with page/slide references
- 🔊 **Voice Audio Playback & Microphone Input** for interactive demos

Currently, you have **${docsCount} document(s)** indexed in memory (${docsNames.join(", ") || "None"}). Ask me any document question or policy details!`;
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
  contextText: string,
  sources: { fileName: string; pageNumber: number; snippet: string }[]
): string {
  const queryLower = message.toLowerCase();
  const paragraphs = contextText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20 && !p.startsWith("==="));

  const terms = queryLower.split(/\s+/).filter((t) => t.length > 2);
  const relevantParagraphs = paragraphs.filter((p) => {
    const pLower = p.toLowerCase();
    return terms.some((term) => pLower.includes(term));
  });

  const excerptsToUse = relevantParagraphs.length > 0 ? relevantParagraphs : paragraphs.slice(0, 3);

  if (excerptsToUse.length === 0) {
    return "No text content found in uploaded documents. Please upload a document to query AI Chat.";
  }

  const topExcerpts = excerptsToUse.slice(0, 4);
  let response = `Based on your uploaded knowledge base documents:\n\n`;
  topExcerpts.forEach((p) => {
    response += `- ${p}\n`;
  });

  if (sources.length > 0) {
    response += `\n[Document: ${sources[0].fileName}, Page: ${sources[0].pageNumber}]`;
  }

  return response;
}

export async function POST(req: Request) {
  try {
    const { message, selectedDocId } = await req.json();

    console.log("========== CHAT REQUEST ==========");
    console.log("Message:", message);

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const documents = getDocuments();
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

    if (documents.length === 0) {
      return NextResponse.json(
        {
          error:
            "No documents have been uploaded yet. Please upload a document or load the demo dataset first.",
        },
        { status: 400 }
      );
    }

    // Build context
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
      contextText = getCombinedDocumentText();
      targetDocNames = activeDocNames;
    }

    // Extract relevant source citations snippets from all document chunks
    const queryTerms = message
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);
    const chunks = getAllDocumentChunks();

    let matchedChunks = chunks.filter((chunk) => {
      const text = chunk.content.toLowerCase();
      return queryTerms.some((term) => text.includes(term));
    });

    if (matchedChunks.length === 0) {
      matchedChunks = chunks.slice(0, 3);
    }

    const matchedSources = matchedChunks.slice(0, 4).map((c) => ({
      fileName: c.fileName,
      pageNumber: c.pageNumber,
      snippet: c.content.substring(0, 180) + "...",
    }));

    // ==========================================
    // PRIMARY AI — GEMINI 2.5 FLASH
    // ==========================================
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "placeholder_key") {
      try {
        console.log("Calling Gemini 2.5 Flash...");
        const answer = await askGemini(message, contextText);

        return NextResponse.json({
          answer,
          modelUsed: "Google Gemini 2.5 Flash Engine",
          documentsCount: documents.length,
          activeDocuments: targetDocNames,
          sources: matchedSources,
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
          answer,
          modelUsed: "OpenRouter AI Engine (Backup)",
          documentsCount: documents.length,
          activeDocuments: targetDocNames,
          sources: matchedSources,
        });
      } catch (openRouterError) {
        console.warn("OpenRouter API call failed:", openRouterError);
      }
    }

    // ==========================================
    // FAIL-SAFE GROUNDING ENGINE (OFFLINE MODE)
    // ==========================================
    console.log("Using Fail-Safe Grounding Engine (Offline Mode)...");
    const offlineAnswer = generateOfflineGroundedAnswer(message, contextText, matchedSources);

    return NextResponse.json({
      answer: offlineAnswer,
      modelUsed: "KCAI Semantic Policy Engine (Offline Mode)",
      documentsCount: documents.length,
      activeDocuments: targetDocNames,
      sources: matchedSources,
    });
  } catch (error) {
    console.error("========== CHAT ERROR ==========", error);
    return NextResponse.json(
      { error: "Failed to process chat request." },
      { status: 500 }
    );
  }
}