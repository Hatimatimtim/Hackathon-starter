import { createWorker } from "tesseract.js";
import { createCanvas } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractTextFromPDF(
  buffer: Buffer
): Promise<string> {
  console.log("Starting PDF OCR...");

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise;

  console.log("PDF pages:", pdf.numPages);

  const worker = await createWorker("eng");

  let fullText = "";

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      console.log(`OCR processing page ${pageNumber}...`);

      const page = await pdf.getPage(pageNumber);

      const viewport = page.getViewport({
        scale: 2,
      });

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

      fullText += `\n\n--- Page ${pageNumber} ---\n\n`;
      fullText += result.data.text;

      console.log(
        `Page ${pageNumber} OCR text length:`,
        result.data.text.length
      );
    }
  } finally {
    await worker.terminate();
  }

  return fullText.trim();
}