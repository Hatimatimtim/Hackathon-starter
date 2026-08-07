import fs from "fs";
import path from "path";

export interface DocumentChunk {
  id: string;
  documentId: string;
  fileName: string;
  pageNumber: number;
  content: string;
}

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  rawText: string;
  chunks: DocumentChunk[];
  uploadTime: string;
}

export interface CustomRule {
  id: string;
  category: "GDPR" | "SOC2" | "ISO27001" | "HIPAA" | "PCI-DSS" | "Internal Policy";
  title: string;
  description: string;
  active: boolean;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  score: number;
  totalChecks: number;
  passed: number;
  flagged: number;
  highSeverity: number;
  documentsCount: number;
  summary: string;
}

declare global {
  var documentsStore: UploadedDocument[] | undefined;
  var customRulesStore: CustomRule[] | undefined;
  var auditHistoryStore: AuditRecord[] | undefined;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DOCS_FILE = path.join(DATA_DIR, "documents.json");
const RULES_FILE = path.join(DATA_DIR, "custom_rules.json");
const AUDITS_FILE = path.join(DATA_DIR, "audits.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.error("Failed to create data directory:", e);
    }
  }
}

// Load documents from disk on startup
if (!globalThis.documentsStore) {
  ensureDataDir();
  if (fs.existsSync(DOCS_FILE)) {
    try {
      const data = fs.readFileSync(DOCS_FILE, "utf-8");
      globalThis.documentsStore = JSON.parse(data);
    } catch (e) {
      console.error("Error reading documents.json:", e);
      globalThis.documentsStore = [];
    }
  } else {
    globalThis.documentsStore = [];
  }
}

// Load custom rules from disk
if (!globalThis.customRulesStore) {
  ensureDataDir();
  if (fs.existsSync(RULES_FILE)) {
    try {
      const data = fs.readFileSync(RULES_FILE, "utf-8");
      globalThis.customRulesStore = JSON.parse(data);
    } catch (e) {
      console.error("Error reading custom_rules.json:", e);
      globalThis.customRulesStore = [];
    }
  } else {
    globalThis.customRulesStore = [];
  }
}

// Load audit history from disk
if (!globalThis.auditHistoryStore) {
  ensureDataDir();
  if (fs.existsSync(AUDITS_FILE)) {
    try {
      const data = fs.readFileSync(AUDITS_FILE, "utf-8");
      globalThis.auditHistoryStore = JSON.parse(data);
    } catch (e) {
      console.error("Error reading audits.json:", e);
      globalThis.auditHistoryStore = [];
    }
  } else {
    globalThis.auditHistoryStore = [];
  }
}

function saveDocumentsToDisk(): void {
  ensureDataDir();
  try {
    fs.writeFileSync(DOCS_FILE, JSON.stringify(globalThis.documentsStore || [], null, 2));
  } catch (e) {
    console.error("Failed to save documents to disk:", e);
  }
}

function saveRulesToDisk(): void {
  ensureDataDir();
  try {
    fs.writeFileSync(RULES_FILE, JSON.stringify(globalThis.customRulesStore || [], null, 2));
  } catch (e) {
    console.error("Failed to save custom rules to disk:", e);
  }
}

function saveAuditsToDisk(): void {
  ensureDataDir();
  try {
    fs.writeFileSync(AUDITS_FILE, JSON.stringify(globalThis.auditHistoryStore || [], null, 2));
  } catch (e) {
    console.error("Failed to save audit history to disk:", e);
  }
}

export function addDocument(doc: UploadedDocument): void {
  if (!globalThis.documentsStore) globalThis.documentsStore = [];
  const existingIndex = globalThis.documentsStore.findIndex(
    (d) => d.fileName === doc.fileName
  );
  if (existingIndex >= 0) {
    globalThis.documentsStore[existingIndex] = doc;
  } else {
    globalThis.documentsStore.push(doc);
  }
  saveDocumentsToDisk();
}

export function getDocuments(): UploadedDocument[] {
  return globalThis.documentsStore || [];
}

export function getDocumentById(id: string): UploadedDocument | undefined {
  return globalThis.documentsStore?.find((d) => d.id === id);
}

export function clearDocuments(): void {
  globalThis.documentsStore = [];
  saveDocumentsToDisk();
}

export function getAllDocumentChunks(): DocumentChunk[] {
  const docs = getDocuments();
  return docs.flatMap((d) => d.chunks);
}

export function getCombinedDocumentText(): string {
  const docs = getDocuments();
  if (docs.length === 0) return "";
  return docs
    .map(
      (d) =>
        `=== DOCUMENT: ${d.fileName} (${d.pageCount} Pages) ===\n${d.rawText}`
    )
    .join("\n\n");
}

// Custom Rules Management
export function getCustomRules(): CustomRule[] {
  return globalThis.customRulesStore || [];
}

export function addCustomRule(rule: Omit<CustomRule, "id">): CustomRule {
  if (!globalThis.customRulesStore) globalThis.customRulesStore = [];
  const newRule: CustomRule = {
    ...rule,
    id: `RULE-CUSTOM-${Date.now().toString().slice(-4)}`,
  };
  globalThis.customRulesStore.push(newRule);
  saveRulesToDisk();
  return newRule;
}

export function deleteCustomRule(id: string): boolean {
  if (!globalThis.customRulesStore) return false;
  const initialLength = globalThis.customRulesStore.length;
  globalThis.customRulesStore = globalThis.customRulesStore.filter((r) => r.id !== id);
  if (globalThis.customRulesStore.length !== initialLength) {
    saveRulesToDisk();
    return true;
  }
  return false;
}

export function toggleCustomRule(id: string): CustomRule | undefined {
  if (!globalThis.customRulesStore) return undefined;
  const rule = globalThis.customRulesStore.find((r) => r.id === id);
  if (rule) {
    rule.active = !rule.active;
    saveRulesToDisk();
  }
  return rule;
}

// Audit History Management
export function getAuditHistory(): AuditRecord[] {
  return (globalThis.auditHistoryStore || []).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function saveAuditToHistory(audit: Omit<AuditRecord, "id">): AuditRecord {
  if (!globalThis.auditHistoryStore) globalThis.auditHistoryStore = [];
  const record: AuditRecord = {
    ...audit,
    id: `AUDIT-${Date.now()}`,
  };
  globalThis.auditHistoryStore.push(record);
  saveAuditsToDisk();
  return record;
}

// Backward compatibility helpers
export function setDocument(pdfBase64: string) {
  addDocument({
    id: "doc-" + Date.now(),
    fileName: "Uploaded_Document.pdf",
    fileSize: pdfBase64.length,
    pageCount: 1,
    rawText: pdfBase64,
    chunks: [
      {
        id: "chunk-1",
        documentId: "doc-" + Date.now(),
        fileName: "Uploaded_Document.pdf",
        pageNumber: 1,
        content: pdfBase64,
      },
    ],
    uploadTime: new Date().toISOString(),
  });
}

export function getDocument(): string {
  return getCombinedDocumentText();
}