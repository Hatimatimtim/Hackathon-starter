import { NextResponse } from "next/server";
import {
  addDocument,
  getDocuments,
  clearDocuments,
  DocumentChunk,
  UploadedDocument,
} from "@/lib/documentStore";
import { parseAnyDocument } from "@/lib/documentParser";

// Pre-loaded sample corporate knowledge base for Instant Hackathon Demonstration
const SAMPLE_DOCUMENTS: { fileName: string; fileSize: number; pageCount: number; text: string }[] = [
  {
    fileName: "Global_Corporate_Security_&_Compliance_Policy_2026.pdf",
    fileSize: 450000,
    pageCount: 4,
    text: `--- Page 1: Information Security Framework ---
SECTION 1: ACCESS CONTROL & MULTI-FACTOR AUTHENTICATION
1.1 All corporate systems, internal APIs, and cloud infrastructure require Multi-Factor Authentication (MFA) using hardware keys or authenticator apps. Password-only login is strictly prohibited.
1.2 Passwords must be at least 14 characters long, containing uppercase letters, numbers, and special symbols. Passwords expire every 90 days.
1.3 Administrative sessions auto-terminate after 15 minutes of inactivity.

--- Page 2: GDPR & Data Retention Regulations ---
SECTION 2: DATA PRIVACY & ERASURE (GDPR / CCPA)
2.1 Personally Identifiable Information (PII) must be encrypted at rest using AES-256 and in transit using TLS 1.3.
2.2 Customer data retention limit is 24 months. After 24 months, customer logs must be permanently anonymized or deleted.
2.3 Data Subject Access Requests (DSAR) and Right-to-be-Forgotten requests must be fulfilled within 14 business days.

--- Page 3: Incident Response & Remote Work Security ---
SECTION 3: DATA BREACH PROTOCOL & BYOD
3.1 Any suspected data breach or unauthorized system access must be reported to security@company.com within 2 hours of discovery.
3.2 Employees working remotely are strictly prohibited from downloading unencrypted customer data onto personal (BYOD) devices.
3.3 Remote connections must pass through company WireGuard VPN.

--- Page 4: Vendor & Third-Party Audit Standards ---
SECTION 4: SOC 2 & THIRD-PARTY RISK MANAGEMENT
4.1 All third-party SaaS vendors and sub-processors must undergo annual SOC 2 Type II audits.
4.2 Vendors lacking SOC 2 certification must be approved by the Chief Information Security Officer (CISO).`,
  },
  {
    fileName: "HR_Employee_Handbook_&_Remote_Work_Guidelines.pptx",
    fileSize: 280000,
    pageCount: 3,
    text: `--- Slide 1: Remote Work Policy ---
Remote work is permitted up to 3 days per week for full-time employees. Core business hours are 10:00 AM to 4:00 PM EST. Equipment allowances of up to $500 per year are provided for home workstation ergonomics.

--- Slide 2: Annual Leave & Sick Days ---
Employees receive 20 paid vacation days and 10 paid sick leave days per calendar year. Unused annual leave up to 5 days rolls over to the next financial year.

--- Slide 3: Code of Conduct & Diversity ---
We enforce zero tolerance for harassment, discrimination, or workplace misconduct. Violations lead to immediate HR review and potential termination.`,
  },
];

// Seed sample documents on server start if store is empty
if (getDocuments().length === 0) {
  SAMPLE_DOCUMENTS.forEach((sample, i) => {
    const docId = `sample-doc-${i + 1}`;
    const chunks: DocumentChunk[] = sample.text
      .split("---")
      .filter((s) => s.trim().length > 0)
      .map((part, idx) => ({
        id: `chunk-${docId}-${idx + 1}`,
        documentId: docId,
        fileName: sample.fileName,
        pageNumber: idx + 1,
        content: part.trim(),
      }));

    addDocument({
      id: docId,
      fileName: sample.fileName,
      fileSize: sample.fileSize,
      pageCount: sample.pageCount,
      rawText: sample.text,
      chunks,
      uploadTime: new Date().toISOString(),
    });
  });
}

export async function GET() {
  try {
    const documents = getDocuments();
    return NextResponse.json({
      success: true,
      totalDocuments: documents.length,
      documents: documents.map((d) => ({
        id: d.id,
        fileName: d.fileName,
        fileSize: d.fileSize,
        pageCount: d.pageCount,
        uploadTime: d.uploadTime,
        previewSnippet: d.rawText.substring(0, 300) + "...",
      })),
    });
  } catch (error: any) {
    console.error("GET UPLOAD ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch uploaded documents" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearDocuments();
    return NextResponse.json({
      success: true,
      message: "Cleared all uploaded documents from memory.",
      totalDocuments: 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to clear documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. JSON Payload handling (Bypasses Vercel serverless binary 4.5MB payload limit)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { fileName, fileSize, rawText, action } = body;

      if (action === "clear_all") {
        clearDocuments();
        return NextResponse.json({ success: true, message: "Cleared all documents.", totalDocuments: 0 });
      }

      if (!fileName || !rawText) {
        return NextResponse.json({ success: false, error: "Missing document title or text content." }, { status: 400 });
      }

      const docId = "doc-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
      const chunkSize = 1500;
      const chunks: DocumentChunk[] = [];
      const text = rawText.trim();

      for (let i = 0; i < text.length; i += chunkSize) {
        const content = text.substring(i, i + chunkSize);
        chunks.push({
          id: `chunk-${docId}-${chunks.length + 1}`,
          documentId: docId,
          fileName,
          pageNumber: chunks.length + 1,
          content,
        });
      }

      const uploadedDoc: UploadedDocument = {
        id: docId,
        fileName,
        fileSize: fileSize || text.length,
        pageCount: Math.max(1, chunks.length),
        rawText: text,
        chunks,
        uploadTime: new Date().toISOString(),
      };

      addDocument(uploadedDoc);

      return NextResponse.json({
        success: true,
        message: `Successfully indexed "${fileName}" (${uploadedDoc.pageCount} sections extracted).`,
        document: {
          id: uploadedDoc.id,
          fileName: uploadedDoc.fileName,
          fileSize: uploadedDoc.fileSize,
          pageCount: uploadedDoc.pageCount,
          chunksCount: chunks.length,
          uploadTime: uploadedDoc.uploadTime,
          previewSnippet: text.substring(0, 300) + "...",
        },
        totalDocuments: getDocuments().length,
      });
    }

    // 2. FormData Binary File Upload handling
    const formData = await req.formData();
    const action = formData.get("action");

    if (action === "clear_all") {
      clearDocuments();
      return NextResponse.json({
        success: true,
        message: "Cleared all uploaded documents.",
        totalDocuments: 0,
      });
    }

    if (action === "load_sample") {
      SAMPLE_DOCUMENTS.forEach((sample, i) => {
        const docId = `sample-doc-${Date.now()}-${i}`;
        const chunks: DocumentChunk[] = sample.text
          .split("---")
          .filter((s) => s.trim().length > 0)
          .map((part, idx) => ({
            id: `chunk-${docId}-${idx + 1}`,
            documentId: docId,
            fileName: sample.fileName,
            pageNumber: idx + 1,
            content: part.trim(),
          }));

        addDocument({
          id: docId,
          fileName: sample.fileName,
          fileSize: sample.fileSize,
          pageCount: sample.pageCount,
          rawText: sample.text,
          chunks,
          uploadTime: new Date().toISOString(),
        });
      });

      return NextResponse.json({
        success: true,
        message: "Successfully loaded hackathon policy demonstration suite (PDF & PPTX).",
        totalDocuments: getDocuments().length,
      });
    }

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided. Please select a document to upload." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`Processing file: ${file.name} (${file.size} bytes)`);

    const parsed = await parseAnyDocument(file.name, buffer);
    const docId = "doc-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

    const chunks: DocumentChunk[] = parsed.pages.map((p, idx) => ({
      id: `chunk-${docId}-${idx + 1}`,
      documentId: docId,
      fileName: file.name,
      pageNumber: p.pageNumber,
      content: p.text,
    }));

    const uploadedDoc: UploadedDocument = {
      id: docId,
      fileName: file.name,
      fileSize: file.size,
      pageCount: parsed.pageCount,
      rawText: parsed.fullText,
      chunks,
      uploadTime: new Date().toISOString(),
    };

    addDocument(uploadedDoc);

    return NextResponse.json({
      success: true,
      message: `Successfully processed "${file.name}" (${parsed.fileType}, ${parsed.pageCount} pages/sections extracted).`,
      document: {
        id: uploadedDoc.id,
        fileName: uploadedDoc.fileName,
        fileSize: uploadedDoc.fileSize,
        pageCount: uploadedDoc.pageCount,
        fileType: parsed.fileType,
        chunksCount: chunks.length,
        uploadTime: uploadedDoc.uploadTime,
        previewSnippet: parsed.fullText.substring(0, 300) + "...",
      },
      totalDocuments: getDocuments().length,
    });
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process document upload.",
      },
      { status: 500 }
    );
  }
}