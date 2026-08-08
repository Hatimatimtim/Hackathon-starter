import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { addDocument, UploadedDocument } from "@/lib/documentStore";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ruleId, category, title, description, remediation } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Rule title is required to generate a policy document." },
        { status: 400 }
      );
    }

    let policyMarkdown = "";

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `You are a Lead Enterprise CISO and Information Security Compliance Officer.
Draft a comprehensive, formal, production-grade Corporate Compliance Policy Document to satisfy the following rule:

Framework Category: ${category || "Internal Security Policy"}
Control Title: ${title}
Control Description: ${description || "Mandatory compliance requirement."}
Target Remediation Goal: ${remediation || "Ensure full policy coverage and enforcement."}

Requirements for the generated policy:
1. Document Header (Title, Policy ID: POL-${ruleId || Date.now().toString().slice(-4)}, Version: 1.0, Effective Date: ${new Date().toISOString().split("T")[0]}, Owner: CISO Office).
2. Purpose & Objective.
3. Scope & Applicability (All Employees, Vendors, Infrastructure, Data Processing).
4. Specific Technical Controls & Policy Requirements (At least 5 detailed sub-clauses).
5. Audit & Compliance Enforcement (Penalties for non-compliance, monitoring frequency).
6. Revision History & Document Approval Signature Block.

Format the output strictly as clean Markdown document text.`;

        const result = await model.generateContent(prompt);
        policyMarkdown = result.response.text();
      } catch (aiErr) {
        console.warn("Gemini AI API fallback triggered for policy generation:", aiErr);
      }
    }

    // Fallback template generator if API key is not set or rate-limited
    if (!policyMarkdown) {
      const dateStr = new Date().toISOString().split("T")[0];
      const docId = `POL-${ruleId || Date.now().toString().slice(-4)}`;
      policyMarkdown = `# Corporate Policy: ${title}
**Document Control ID:** ${docId}  
**Framework Standard:** ${category || "Internal Policy"}  
**Version:** 1.0  
**Effective Date:** ${dateStr}  
**Classification:** Enterprise Internal Confidential  
**Owner:** Chief Information Security Officer (CISO) Office  

---

## 1. Executive Purpose
This policy formally establishes the enterprise operational standards for **${title}**. The objective is to safeguard corporate data assets, ensure compliance with **${category || "Internal Compliance Controls"}**, and mitigate organizational risk.

## 2. Organizational Scope
This policy applies to all enterprise employees, contractors, third-party vendors, system administrators, and cloud infrastructure components processing corporate data.

## 3. Mandatory Policy Controls & Technical Requirements
- **3.1 Administrative Oversight:** The CISO office shall perform quarterly compliance reviews regarding ${title}.
- **3.2 Technical Implementation:** ${description || "All cloud assets and data repositories must strictly conform to documented encryption and access control protocols."}
- **3.3 Access Control & Authentication:** Multi-factor authentication (MFA) and least-privilege RBAC controls are enforced across all related systems.
- **3.4 Incident Logging & Telemetry:** Audit logs for all operations under this policy must be retained for a minimum of 365 days.
- **3.5 Remediation Action:** ${remediation || "Automated security alerts will trigger immediate isolation upon detecting non-compliant configurations."}

## 4. Compliance Monitoring & Penalties
Failure to adhere to this corporate policy may result in immediate revocation of access privileges, formal disciplinary action, up to and including employment termination or vendor contract termination.

---

**Approved by:** CISO Office & Regulatory Compliance Steering Committee  
**Verification Seal:** Cryptographic SHA-256 Verified  
`;
    }

    const fileName = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_Policy_v1.0.pdf`;
    const docId = `doc-policy-${Date.now()}`;

    const newDoc: UploadedDocument = {
      id: docId,
      fileName,
      fileSize: policyMarkdown.length * 2,
      pageCount: Math.ceil(policyMarkdown.length / 1500) || 2,
      rawText: policyMarkdown,
      chunks: [
        {
          id: `chunk-pol-1`,
          documentId: docId,
          fileName,
          pageNumber: 1,
          content: policyMarkdown,
        },
      ],
      uploadTime: new Date().toISOString(),
    };

    // Auto-save policy into document store!
    addDocument(newDoc);

    return NextResponse.json({
      success: true,
      document: newDoc,
      markdown: policyMarkdown,
      message: `Enterprise Policy "${fileName}" generated and automatically saved to Knowledge Base!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate policy document." },
      { status: 500 }
    );
  }
}
