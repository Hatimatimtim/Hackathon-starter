import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractRealTextFromPDFBuffer(arrayBuffer: ArrayBuffer): Promise<{ text: string; pageCount: number }> {
  try {
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
    } as any).promise;

    let fullText = "";
    const numPages = pdf.numPages || 1;

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        if (pageText.length > 0) {
          fullText += `\n--- Page ${i} ---\n` + pageText;
        }
      } catch (pageErr) {
        console.warn(`Error reading page ${i}:`, pageErr);
      }
    }

    const cleanText = fullText.trim();
    if (cleanText.length > 10) {
      return { text: cleanText, pageCount: numPages };
    }
  } catch (err) {
    console.warn("Client PDF extraction warning:", err);
  }

  // Fallback UTF-8 text decoder if PDF stream is raw
  try {
    const decoder = new TextDecoder("utf-8");
    const raw = decoder.decode(arrayBuffer);
    const clean = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
    if (clean.length > 30) {
      return { text: clean, pageCount: 1 };
    }
  } catch (e) {}

  return { text: "", pageCount: 1 };
}
