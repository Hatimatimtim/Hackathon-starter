import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createWorker } from "tesseract.js";

// Check if string is raw PDF binary syntax garbage (%PDF-1.3, FlateDecode, obj, etc.)
export function isPdfBinarySyntax(text: string): boolean {
  if (!text) return true;
  if (text.includes("%PDF-") || text.includes("FlateDecode") || text.includes("/MediaBox")) return true;
  if (text.includes("endobj") || text.includes("endstream") || text.includes("/Contents 4 0 R")) return true;
  if (/<<\s*\/Type\s*\/Page/i.test(text) || /<<\s*\/Filter\s*\/FlateDecode/i.test(text)) return true;
  return false;
}

// Clean human-readable words from PDF page text
export function cleanHumanText(raw: string): string {
  if (!raw || isPdfBinarySyntax(raw)) return "";

  // Filter out PDF stream tokens
  const clean = raw
    .replace(/%PDF-[\d.]+/g, "")
    .replace(/<<.*?>>/g, "")
    .replace(/\/[\w]+\b/g, "")
    .replace(/endobj|obj|endstream|stream/g, "")
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return clean;
}

export async function extractRealTextFromPDFBuffer(arrayBuffer: ArrayBuffer): Promise<{ text: string; pageCount: number }> {
  try {
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
    } as any).promise;

    let fullText = "";
    const numPages = pdf.numPages || 1;

    // 1. Extract Native PDF Text Stream
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const rawPageText = textContent.items
          .map((item: any) => item.str || "")
          .join(" ")
          .trim();

        if (!isPdfBinarySyntax(rawPageText)) {
          const cleaned = cleanHumanText(rawPageText);
          if (cleaned.length > 5) {
            fullText += `\n--- Page ${i} ---\n` + cleaned;
          }
        }
      } catch (pageErr) {
        console.warn(`Error reading page ${i}:`, pageErr);
      }
    }

    const cleanResultText = fullText.trim();
    if (cleanResultText.length > 15 && !isPdfBinarySyntax(cleanResultText)) {
      return { text: cleanResultText, pageCount: numPages };
    }

    // 2. OCR Fallback for Image/Scanned PDFs (e.g. Scanned Certificates or Marksheets)
    console.log("Scanned PDF detected without text stream. Running browser OCR...");
    let ocrText = "";
    let worker: any = null;

    try {
      if (typeof window !== "undefined") {
        worker = await createWorker("eng");

        for (let i = 1; i <= Math.min(numPages, 3); i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext("2d");

          if (context) {
            await page.render({
              canvasContext: context,
              canvas: canvas as any,
              viewport,
            }).promise;

            const res = await worker.recognize(canvas);
            const recognized = res.data.text.trim();
            if (recognized.length > 0 && !isPdfBinarySyntax(recognized)) {
              ocrText += `\n--- Page ${i} (OCR) ---\n` + recognized;
            }
          }
        }
      }
    } catch (ocrErr) {
      console.warn("Browser OCR error:", ocrErr);
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch (e) {}
      }
    }

    const cleanOcr = ocrText.trim();
    if (cleanOcr.length > 10 && !isPdfBinarySyntax(cleanOcr)) {
      return { text: cleanOcr, pageCount: numPages };
    }
  } catch (err) {
    console.warn("Client PDF extraction error:", err);
  }

  return {
    text: "",
    pageCount: 1,
  };
}
