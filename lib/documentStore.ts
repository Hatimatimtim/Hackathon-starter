declare global {
  var uploadedDocument: string | undefined;
}

export function setDocument(pdfBase64: string) {
  globalThis.uploadedDocument = pdfBase64;
}

export function getDocument(): string {
  return globalThis.uploadedDocument || "";
}