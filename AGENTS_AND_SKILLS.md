# Custom Agents and Custom Skills Documentation

This document outlines the custom agents and custom skills implemented and committed in this repository for the **Knowledge & Compliance Agent** project.

---

## 1. Custom Agents

### Custom Agent 1: Compliance Auditor Agent (`compliance-auditor`)
- **File Location**: [agents/compliance-auditor.json](file:///c:/Users/KIIT/Desktop/KnowledgeCompliance/agents/compliance-auditor.json) & [.agents/agents/compliance-auditor.json](file:///c:/Users/KIIT/Desktop/KnowledgeCompliance/.agents/agents/compliance-auditor.json)
- **Role**: Automated Regulatory & Policy Compliance Auditor
- **Description**: An AI agent specifically optimized for auditing unstructured legal, security, and enterprise documents against defined compliance frameworks (GDPR, HIPAA, ISO27001, SOC2, and Custom Policies).
- **Core Features**:
  - Direct integration with document parsing pipeline (PDF, DOCX, TXT, OCR)
  - Strict passage-level citation extraction
  - Pass/Fail/Needs-Review risk matrix classification
  - Automated remediation action recommendation
  - Refusal to hallucinate non-existent compliance clauses

---

## 2. Custom Skills

### Custom Skill 1: Document Compliance Audit Skill (`document-compliance-audit`)
- **Skill Directory**: [skills/document-compliance-audit/SKILL.md](file:///c:/Users/KIIT/Desktop/KnowledgeCompliance/skills/document-compliance-audit/SKILL.md) & [.agents/skills/document-compliance-audit/SKILL.md](file:///c:/Users/KIIT/Desktop/KnowledgeCompliance/.agents/skills/document-compliance-audit/SKILL.md)
- **Description**: Evaluates messy, unstructured document text against regulatory rules and produces structured, verifiable audit reports with verbatim passage citations.

#### Key Capabilities:
1. **Unstructured Document Parsing**: Extracts formatted text from scanned PDFs, DOCX files, images, and plain text.
2. **Context-Aware Semantic Search**: Performs RAG vector indexing and chunking to map rules against relevant document sections.
3. **Pass/Fail Audit Generation**: Generates itemized pass/fail reports with evidence snippets, page numbers, line ranges, and confidence scores.
4. **Citation Grounding**: Validates that every compliance assertion points to a non-empty, verbatim text snippet extracted directly from source documents.
