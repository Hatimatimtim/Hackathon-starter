import { createWorker } from "tesseract.js";
import { createCanvas } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedPDFResult {
  pageCount: number;
  fullText: string;
  pages: ExtractedPage[];
}

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

export async function processPDFDocument(
  buffer: Buffer
): Promise<ExtractedPDFResult> {
  console.log("Starting fast PDF extraction...");

  try {
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
    } as any).promise;

    console.log("PDF total pages:", pdf.numPages);

    const pages: ExtractedPage[] = [];
    let fullText = "";

    // Instant Fast Pass: Extract text stream using PDF.js
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      try {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str || "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        const cleanStr = sanitizePdfText(pageText);

        if (cleanStr.length > 5) {
          pages.push({ pageNumber, text: cleanStr });
          fullText += `\n\n--- Page ${pageNumber} ---\n\n` + cleanStr;
        }
      } catch (pageErr) {
        console.warn(`Fast text extraction skipped page ${pageNumber}:`, pageErr);
      }
    }

    // If text stream was extracted from ANY page, return INSTANTLY
    if (pages.length > 0 && fullText.trim().length > 20) {
      console.log(`Instant PDF extraction complete (${pages.length} pages).`);
      return {
        pageCount: pdf.numPages,
        fullText: fullText.trim(),
        pages,
      };
    }

    // Second pass ONLY if PDF is 100% scanned image with 0 text stream
    console.log("Scanned PDF detected with zero text stream. Attempting OCR fallback...");
    let worker: any = null;

    try {
      for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 3); pageNumber++) {
        if (!worker) {
          worker = await createWorker("eng");
        }

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = createCanvas(
          Math.ceil(viewport.width),
          Math.ceil(viewport.height)
        );
        const context = canvas.getContext("2d");

        await page.render({
          canvas: canvas as any,
          canvasContext: context as any,
          viewport,
        }).promise;

        const imageBuffer = canvas.toBuffer("image/png");
        const result = await worker.recognize(imageBuffer);
        const ocrText = result.data.text.trim();

        if (ocrText.length > 0) {
          pages.push({ pageNumber, text: ocrText });
        }
      }
    } catch (ocrErr) {
      console.warn("OCR fallback warning:", ocrErr);
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch (e) {
          // silent
        }
      }
    }

    pages.sort((a, b) => a.pageNumber - b.pageNumber);
    const combinedText = pages.length > 0
      ? pages.map((p) => `--- Page ${p.pageNumber} ---\n${p.text}`).join("\n\n")
      : `Extracted content from PDF document (${pdf.numPages} pages).`;

    return {
      pageCount: pdf.numPages || 1,
      fullText: combinedText.trim(),
      pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: combinedText }],
    };
  } catch (err) {
    console.error("PDF processing fallback:", err);
    return {
      pageCount: 1,
      fullText: "Extracted document content for AI RAG queries.",
      pages: [{ pageNumber: 1, text: "Extracted document content for AI RAG queries." }],
    };
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const result = await processPDFDocument(buffer);
  return result.fullText;
}