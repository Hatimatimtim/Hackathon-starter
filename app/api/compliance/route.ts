import { NextResponse } from "next/server";
import {
  getDocuments,
  getCombinedDocumentText,
  getCustomRules,
  saveAuditToHistory,
} from "@/lib/documentStore";
import { getTopRelevantChunks } from "@/lib/vectorRAG";
import { askGemini } from "@/services/gemini";
import { askOpenRouter } from "@/services/openrouter";

export interface RuleCheck {
  id: string;
  category: "GDPR" | "SOC2" | "ISO27001" | "HIPAA" | "PCI-DSS" | "Internal Policy";
  title: string;
  description: string;
  status: "PASS" | "FLAGGED" | "NEEDS_REVIEW";
  severity: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  evidence: string;
  remediation: string;
}

export interface ComplianceReport {
  overallScore: number;
  totalChecks: number;
  passedChecks: number;
  flaggedChecks: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
  documentsAnalyzed: number;
  auditTimestamp: string;
  frameworksCovered: string[];
  rules: RuleCheck[];
  summary: string;
}

const DEFAULT_RULE_SETS: Omit<RuleCheck, "status" | "severity" | "evidence" | "remediation">[] = [
  {
    id: "RULE-GDPR-01",
    category: "GDPR",
    title: "Data Retention & Encryption",
    description: "Requires explicit data storage limits, encryption at rest/transit, and anonymization rules.",
  },
  {
    id: "RULE-GDPR-02",
    category: "GDPR",
    title: "Right to Erasure & Access",
    description: "Provides mechanism for user data subject access requests (DSAR) and data deletion.",
  },
  {
    id: "RULE-SOC2-01",
    category: "SOC2",
    title: "Multi-Factor Authentication (MFA)",
    description: "Mandates MFA for all administrative and user access to internal tools and infrastructure.",
  },
  {
    id: "RULE-SOC2-02",
    category: "SOC2",
    title: "Incident Response Plan",
    description: "Requires a documented data breach reporting and severity escalation process.",
  },
  {
    id: "RULE-ISO-01",
    category: "ISO27001",
    title: "Access Control & Password Policy",
    description: "Enforces password complexity, regular rotations, and minimum 12-character lengths.",
  },
  {
    id: "RULE-ISO-02",
    category: "ISO27001",
    title: "Third-Party Vendor Risk Audit",
    description: "Requires annual security assessments for all SaaS and cloud infrastructure vendors.",
  },
  {
    id: "RULE-INT-01",
    category: "Internal Policy",
    title: "Remote Work & BYOD Security",
    description: "Prohibits unencrypted local document downloads on personal non-company devices.",
  },
];

function getCombinedRules() {
  const custom = getCustomRules().filter((r) => r.active);
  const formattedCustom = custom.map((r) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    description: r.description,
  }));
  return [...DEFAULT_RULE_SETS, ...formattedCustom];
}

function generateFallbackComplianceReport(documentText: string, documentsCount: number): ComplianceReport {
  const lowerText = documentText.toLowerCase();
  const allRules = getCombinedRules();

  const rules: RuleCheck[] = allRules.map((def) => {
    let status: "PASS" | "FLAGGED" | "NEEDS_REVIEW" = "NEEDS_REVIEW";
    let severity: "HIGH" | "MEDIUM" | "LOW" | "NONE" = "MEDIUM";
    let evidence = "Information not explicitly identified in document.";
    let remediation = `Update documentation to address ${def.title} requirement.`;

    // Semantic RAG chunk check for exact evidence location
    const topChunks = getTopRelevantChunks(`${def.title} ${def.description}`, 1);
    if (topChunks.length > 0 && topChunks[0].score > 0.4) {
      const topChunk = topChunks[0].chunk;
      evidence = `Matching excerpt found on page ${topChunk.pageNumber} of ${topChunk.fileName}: "${topChunk.content.slice(0, 150)}..."`;
    }

    if (def.id === "RULE-GDPR-01") {
      if (lowerText.includes("encrypt") || lowerText.includes("retention") || lowerText.includes("privacy")) {
        status = "PASS";
        severity = "NONE";
        remediation = "Maintain current retention and encryption schedule.";
      }
    } else if (def.id === "RULE-GDPR-02") {
      if (lowerText.includes("erasure") || lowerText.includes("deletion") || lowerText.includes("dsar") || lowerText.includes("privacy")) {
        status = "PASS";
        severity = "NONE";
        remediation = "Ensure DSAR requests are logged in audit system.";
      }
    } else if (def.id === "RULE-SOC2-01") {
      if (lowerText.includes("mfa") || lowerText.includes("multi-factor") || lowerText.includes("authentication")) {
        status = "PASS";
        severity = "NONE";
        remediation = "Enforce hardware keys across administrative accounts.";
      }
    } else if (def.id === "RULE-SOC2-02") {
      if (lowerText.includes("breach") || lowerText.includes("incident") || lowerText.includes("security@")) {
        status = "PASS";
        severity = "NONE";
        remediation = "Conduct bi-annual breach tabletop drills.";
      }
    } else if (def.id === "RULE-ISO-01") {
      if (lowerText.includes("password") || lowerText.includes("14 characters") || lowerText.includes("expire")) {
        status = "PASS";
        severity = "NONE";
        remediation = "Verify password manager adoption.";
      } else {
        status = "FLAGGED";
        severity = "HIGH";
        remediation = "Add minimum 14-character requirement to IT policy.";
      }
    } else if (def.id === "RULE-ISO-02") {
      if (lowerText.includes("vendor") || lowerText.includes("soc 2") || lowerText.includes("saas")) {
        status = "PASS";
        severity = "NONE";
        remediation = "Review sub-processor inventory annually.";
      }
    } else if (def.id === "RULE-INT-01") {
      if (lowerText.includes("remote") || lowerText.includes("byod") || lowerText.includes("vpn")) {
        status = "PASS";
        severity = "NONE";
        remediation = "Enforce mobile device management (MDM) policies.";
      }
    } else if (def.id.startsWith("RULE-CUSTOM-")) {
      // Dynamic fallback check for custom rules
      const keywords = def.title.toLowerCase().split(" ").concat(def.description.toLowerCase().split(" "));
      const matches = keywords.filter((k) => k.length > 3 && lowerText.includes(k));
      if (matches.length >= 2) {
        status = "PASS";
        severity = "NONE";
        remediation = `Maintain compliance with ${def.title}.`;
      } else {
        status = "FLAGGED";
        severity = "MEDIUM";
        remediation = `Update corporate policy document to explicitly detail ${def.title}.`;
      }
    }

    return {
      ...def,
      category: def.category as any,
      status,
      severity,
      evidence,
      remediation,
    };
  });

  const passedCount = rules.filter((r) => r.status === "PASS").length;
  const flaggedCount = rules.filter((r) => r.status === "FLAGGED").length;
  const highSev = rules.filter((r) => r.severity === "HIGH").length;
  const medSev = rules.filter((r) => r.severity === "MEDIUM").length;
  const lowSev = rules.filter((r) => r.severity === "LOW").length;

  const score = Math.round((passedCount / rules.length) * 100);

  const frameworksSet = new Set(rules.map((r) => r.category));

  return {
    overallScore: score,
    totalChecks: rules.length,
    passedChecks: passedCount,
    flaggedChecks: flaggedCount,
    highSeverityCount: highSev,
    mediumSeverityCount: medSev,
    lowSeverityCount: lowSev,
    documentsAnalyzed: documentsCount,
    auditTimestamp: new Date().toISOString(),
    frameworksCovered: Array.from(frameworksSet),
    rules,
    summary: `Compliance audit completed across ${documentsCount} document(s). Evaluated ${passedCount} passed controls, ${flaggedCount} flagged items, and ${highSev} high-severity risk(s).`,
  };
}

export async function GET() {
  const documents = getDocuments();
  const rules = getCombinedRules();

  return NextResponse.json({
    frameworks: ["GDPR", "SOC 2 Type II", "ISO 27001", "HIPAA", "PCI-DSS", "Internal IT Policies"],
    totalRulesDefined: rules.length,
    documentsUploaded: documents.length,
    status: documents.length > 0 ? "READY_FOR_AUDIT" : "NO_DOCUMENTS",
  });
}

export async function POST() {
  try {
    const documents = getDocuments();

    if (documents.length === 0) {
      return NextResponse.json(
        {
          error:
            "No documents uploaded. Please upload policy documents or load the demo dataset to execute an audit.",
        },
        { status: 400 }
      );
    }

    const documentText = getCombinedDocumentText();

    let report: ComplianceReport;

    // Try AI generation if key exists
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "placeholder_key") {
      try {
        const rulesListPrompt = JSON.stringify(getCombinedRules(), null, 2);
        const auditPrompt = `
Perform a thorough compliance audit of the provided document text against the following policy rules list:
${rulesListPrompt}

Format response strictly as JSON:
{
  "overallScore": 85,
  "summary": "Summary paragraph...",
  "rules": [
    {
      "id": "RULE-GDPR-01",
      "category": "GDPR",
      "title": "Data Retention & Encryption",
      "status": "PASS",
      "severity": "NONE",
      "evidence": "Quoted text with page citation",
      "remediation": "Action step"
    }
  ]
}

DOCUMENT TEXT:
${documentText.slice(0, 12000)}
`;
        const rawAiResponse = await askGemini("Compliance Audit Request", auditPrompt);
        let cleaned = rawAiResponse.trim();
        if (cleaned.startsWith("```json")) cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
        else if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(cleaned);

        if (parsed && Array.isArray(parsed.rules)) {
          const rulesList: RuleCheck[] = parsed.rules;
          const passedCount = rulesList.filter((r) => r.status === "PASS").length;
          const flaggedCount = rulesList.filter((r) => r.status === "FLAGGED").length;
          const highSev = rulesList.filter((r) => r.severity === "HIGH").length;

          report = {
            overallScore: parsed.overallScore || Math.round((passedCount / rulesList.length) * 100),
            totalChecks: rulesList.length,
            passedChecks: passedCount,
            flaggedChecks: flaggedCount,
            highSeverityCount: highSev,
            mediumSeverityCount: rulesList.filter((r) => r.severity === "MEDIUM").length,
            lowSeverityCount: rulesList.filter((r) => r.severity === "LOW").length,
            documentsAnalyzed: documents.length,
            auditTimestamp: new Date().toISOString(),
            frameworksCovered: Array.from(new Set(rulesList.map((r) => r.category))),
            rules: rulesList,
            summary: parsed.summary || "Audit completed via Gemini AI Engine.",
          };

          // Save audit run into persistent history
          saveAuditToHistory({
            timestamp: report.auditTimestamp,
            score: report.overallScore,
            totalChecks: report.totalChecks,
            passed: report.passedChecks,
            flagged: report.flaggedChecks,
            highSeverity: report.highSeverityCount,
            documentsCount: report.documentsAnalyzed,
            summary: report.summary,
          });

          return NextResponse.json({ success: true, report });
        }
      } catch (geminiErr) {
        console.warn("Gemini audit failed, using fail-safe audit scanner:", geminiErr);
      }
    }

    // Fail-safe audit engine
    console.log("Running Fail-Safe Compliance Audit Scanner...");
    report = generateFallbackComplianceReport(documentText, documents.length);

    // Save audit run into persistent history
    saveAuditToHistory({
      timestamp: report.auditTimestamp,
      score: report.overallScore,
      totalChecks: report.totalChecks,
      passed: report.passedChecks,
      flagged: report.flaggedChecks,
      highSeverity: report.highSeverityCount,
      documentsCount: report.documentsAnalyzed,
      summary: report.summary,
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("COMPLIANCE AUDIT ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate compliance report." },
      { status: 500 }
    );
  }
}
