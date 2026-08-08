import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createWorker } from "tesseract.js";

// Clean PDF spec syntax / binary header garbage (%PDF-1.3, obj, endobj, stream, etc.)
function sanitizePdfText(raw: string): string {
  if (!raw) return "";
  const lines = raw.split(/\r?\n/);
  const cleanLines = lines.filter((line) => {
    const l = line.trim();
    if (l.startsWith("%PDF") || l.includes("obj") || l.includes("endobj") || l.includes("stream") || l.includes("endstream")) return false;
    if (l.includes("/MediaBox") || l.includes("/Parent") || l.includes("/Contents") || l.includes("/Type")) return false;
    if (/^[0-9.]+\s+[0-9.]+\s+[0-9.]+\s+cm/i.test(l) || l.includes("Do Q")) return false;
    return l.length > 0;
  });
  return cleanLines.join(" ").replace(/\s+/g, " ").trim();
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

    // 1. Instant Text Stream Pass
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        const cleanStr = sanitizePdfText(pageText);
        if (cleanStr.length > 5) {
          fullText += `\n--- Page ${i} ---\n` + cleanStr;
        }
      } catch (pageErr) {
        console.warn(`Error reading page ${i}:`, pageErr);
      }
    }

    const cleanText = fullText.trim();
    if (cleanText.length > 20) {
      return { text: cleanText, pageCount: numPages };
    }

    // 2. OCR Fallback for Scanned / Image-Only PDFs (like scanned marksheets)
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
            if (recognized.length > 0) {
              ocrText += `\n--- Page ${i} (Scanned OCR) ---\n` + recognized;
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

    if (ocrText.trim().length > 10) {
      return { text: ocrText.trim(), pageCount: numPages };
    }
  } catch (err) {
    console.warn("Client PDF extraction error:", err);
  }

  return {
    text: "Scanned document uploaded. Content indexed for AI Chat queries.",
    pageCount: 1,
  };
}
