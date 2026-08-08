---
name: document-compliance-audit
description: Analyzes unstructured documents against compliance standards (GDPR, HIPAA, ISO27001, SOC2) and extracts grounded audit results with passage-level citations.
---

# Document Compliance Audit Skill

## Overview
This skill provides automated compliance auditing, grounded question answering, and risk evaluation over messy unstructured documents (scanned PDFs, DOCX, TXT, OCR images).

## Execution Workflow

1. **Ingest & Parse**:
   - Parse input files into structured chunks using `lib/documentParser.ts` (PDF.js, Mammoth DOCX, Tesseract OCR).
   - Assign document metadata, line numbers, and page numbers to each chunk.

2. **Grounding & Rule Evaluation**:
   - For each active compliance rule (GDPR, HIPAA, ISO27001, SOC2, Custom):
     - Search relevant document chunks via vector RAG index (`lib/vectorRAG.ts`).
     - Compare chunk contents against rule requirements.

3. **Pass / Fail Classification & Evidence Extraction**:
   - Assign status:
     - `PASS`: Requirement explicitly satisfied in document text.
     - `FAIL`: Requirement violated or absent where mandatory.
     - `NEEDS_REVIEW`: Ambiguous context requiring human oversight.
   - Extract exact verbatim passage quote, page number, and line numbers.

4. **Refusal Protocol**:
   - If document text is missing or unreadable, return explicit refusal to hypothesize.

## Output Format
```json
{
  "auditId": "string",
  "documentId": "string",
  "score": 85,
  "items": [
    {
      "ruleId": "GDPR-ART-5",
      "ruleTitle": "Data Processing & Storage Limitation",
      "status": "PASS",
      "confidenceScore": 0.95,
      "evidence": [
        {
          "passageText": "Personal data shall be stored for no longer than 36 months post-contract termination.",
          "documentName": "privacy_policy.pdf",
          "pageNumber": 3,
          "lineNumberRange": "45-48"
        }
      ],
      "riskReasoning": "Section 4.2 explicitly defines data retention caps aligned with GDPR Art. 5."
    }
  ]
}
```
