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

export async function processPDFDocument(
  buffer: Buffer
): Promise<ExtractedPDFResult> {
  console.log("Starting PDF extraction...");

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
  } as any).promise;

  console.log("PDF total pages:", pdf.numPages);

  const pages: ExtractedPage[] = [];
  let fullText = "";
  let needsOCR = false;

  // First pass: Try fast native text stream extraction
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str || "")
      .join(" ")
      .trim();

    if (pageText.length > 30) {
      pages.push({ pageNumber, text: pageText });
      fullText += `\n\n--- Page ${pageNumber} ---\n\n` + pageText;
    } else {
      needsOCR = true;
    }
  }

  // If text was found on all pages, return immediately
  if (pages.length === pdf.numPages && !needsOCR) {
    return {
      pageCount: pdf.numPages,
      fullText: fullText.trim(),
      pages,
    };
  }

  // Second pass: Use Tesseract OCR for scanned pages or empty pages
  console.log("Running Tesseract OCR for image-based/scanned pages...");
  let worker: any = null;

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const existing = pages.find((p) => p.pageNumber === pageNumber);
      if (existing && existing.text.length > 50) continue;

      try {
        if (!worker) {
          worker = await createWorker("eng");
        }

        console.log(`OCR processing page ${pageNumber}...`);
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });
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

        const existingIndex = pages.findIndex((p) => p.pageNumber === pageNumber);
        if (existingIndex >= 0) {
          pages[existingIndex].text = ocrText;
        } else if (ocrText.length > 0) {
          pages.push({ pageNumber, text: ocrText });
        }
      } catch (pageErr) {
        console.warn(`OCR page ${pageNumber} skipped:`, pageErr);
      }
    }
  } catch (err) {
    console.warn("OCR fallback warning:", err);
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
  const combinedText = pages
    .map((p) => `--- Page ${p.pageNumber} ---\n${p.text}`)
    .join("\n\n");

  return {
    pageCount: pdf.numPages,
    fullText: combinedText.trim(),
    pages,
  };
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const result = await processPDFDocument(buffer);
  return result.fullText;
}