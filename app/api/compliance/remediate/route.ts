import { NextResponse } from "next/server";
import { askGemini } from "@/services/gemini";
import { askOpenRouter } from "@/services/openrouter";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, category, description, evidence, remediation } = body;

    if (!title || !category) {
      return NextResponse.json({ error: "Missing rule information." }, { status: 400 });
    }

    const prompt = `
You are a Senior Corporate Legal & Regulatory Compliance Counsel.
Generate an official, legally compliant Policy Clause Amendment / Redline Snippet to fix the following compliance deficiency.

DEFICIENCY DETAILS:
- Rule ID: ${id || "RULE-01"}
- Framework: ${category}
- Title: ${title}
- Description: ${description}
- Current Document Finding / Gap: "${evidence || "No clause present in policy document."}"
- Recommended Action: ${remediation}

Provide your output strictly in Markdown format with:
1. Executive Summary of the Change
2. Standard Policy Clause Wording (Ready to insert into corporate handbook or contract)
3. Operational Controls & Verification Steps
`;

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "placeholder_key") {
      try {
        const patchText = await askGemini("Policy Remediation Request", prompt);
        return NextResponse.json({ success: true, patch: patchText });
      } catch (e) {
        console.warn("Gemini remediation failed, using fallback generator:", e);
      }
    }

    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== "placeholder_key") {
      try {
        const patchText = await askOpenRouter("Policy Remediation Request", prompt);
        return NextResponse.json({ success: true, patch: patchText });
      } catch (e) {
        console.warn("OpenRouter remediation failed, using fallback generator:", e);
      }
    }

    // Fallback generator if no AI keys are available
    const fallbackPatch = `### 📋 Policy Clause Amendment: ${title} (${category})

**Executive Summary:**
This amendment establishes mandatory compliance controls for ${title} under ${category} regulatory standards.

**Standard Policy Wording (Clause Addendum):**
> **Section ${id || "POL-101"}: ${title}**
> 1. **Mandatory Standard:** The organization shall enforce strict ${title.toLowerCase()} policies across all infrastructure, endpoints, and data repositories.
> 2. **Operational Controls:** All personnel, contractors, and sub-processors must comply with ${description.toLowerCase()}
> 3. **Auditability:** Compliance logs and verification records shall be retained for a minimum of 36 months and audited annually by certified compliance assessors.

**Operational Verification Checklist:**
- [ ] Review current documentation for compliance with ${category} requirements.
- [ ] Implement mandatory technical controls and log aggregation.
- [ ] Schedule bi-annual policy audit and staff awareness training.
`;

    return NextResponse.json({
      success: true,
      patch: fallbackPatch,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate remediation clause." },
      { status: 500 }
    );
  }
}
