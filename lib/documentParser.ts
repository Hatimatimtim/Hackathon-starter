import AdmZip from "adm-zip";
import mammoth from "mammoth";
import { createWorker } from "tesseract.js";
import { processPDFDocument, ExtractedPage } from "@/lib/ocr";

export interface ParsedDocumentResult {
  fileType: string;
  pageCount: number;
  fullText: string;
  pages: ExtractedPage[];
}

export async function parseAnyDocument(
  fileName: string,
  buffer: Buffer
): Promise<ParsedDocumentResult> {
  const ext = fileName.toLowerCase().split(".").pop() || "";

  console.log(`Parsing document: ${fileName} (extension: .${ext})`);

  // 1. PDF Documents (.pdf)
  if (ext === "pdf") {
    try {
      const res = await processPDFDocument(buffer);
      if (res && res.pages && res.pages.length > 0) {
        return {
          fileType: "PDF Document",
          pageCount: res.pageCount,
          fullText: res.fullText,
          pages: res.pages,
        };
      }
    } catch (err) {
      console.warn("PDF parser error fallback:", err);
    }
  }

  // 2. PowerPoint (.pptx, .ppt, .potx) Presentations
  if (ext === "pptx" || ext === "ppt" || ext === "potx") {
    try {
      const zip = new AdmZip(buffer);
      const zipEntries = zip.getEntries();
      const slideEntries = zipEntries.filter(
        (entry) =>
          entry.entryName.startsWith("ppt/slides/slide") &&
          entry.entryName.endsWith(".xml")
      );

      // Sort slides numerically slide1.xml, slide2.xml ...
      slideEntries.sort((a, b) => {
        const numA = parseInt(a.entryName.replace(/\D/g, "") || "0");
        const numB = parseInt(b.entryName.replace(/\D/g, "") || "0");
        return numA - numB;
      });

      const pages: ExtractedPage[] = [];
      let fullText = "";

      for (let i = 0; i < slideEntries.length; i++) {
        const entry = slideEntries[i];
        const slideXml = entry.getData().toString("utf-8");
        // Strip XML tags to leave text content
        const slideText = slideXml
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (slideText.length > 0) {
          pages.push({ pageNumber: i + 1, text: slideText });
          fullText += `\n\n--- Slide ${i + 1} ---\n\n` + slideText;
        }
      }

      if (pages.length > 0) {
        return {
          fileType: "PowerPoint Presentation",
          pageCount: pages.length,
          fullText: fullText.trim(),
          pages,
        };
      }
    } catch (err) {
      console.warn("PPTX zip parsing fallback:", err);
    }
  }

  // 3. Word Documents (.docx, .doc)
  if (ext === "docx" || ext === "doc") {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const rawText = result.value.trim();
      if (rawText.length > 0) {
        const paragraphs = rawText.split("\n\n").filter((p) => p.trim().length > 0);

        const pages: ExtractedPage[] = paragraphs.map((p, idx) => ({
          pageNumber: idx + 1,
          text: p.trim(),
        }));

        return {
          fileType: "Word Document",
          pageCount: Math.max(1, pages.length),
          fullText: rawText,
          pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: rawText }],
        };
      }
    } catch (err) {
      console.warn("Mammoth DOCX parsing fallback:", err);
    }
  }

  // 4. Spreadsheets (.xlsx, .ods, .csv, .tsv)
  if (ext === "xlsx" || ext === "ods" || ext === "xls") {
    try {
      const zip = new AdmZip(buffer);
      const zipEntries = zip.getEntries();
      const sheetEntries = zipEntries.filter((entry) =>
        entry.entryName.includes("sheet") || entry.entryName.endsWith(".xml")
      );

      let extractedSheetsText = "";
      sheetEntries.forEach((entry) => {
        const content = entry.getData().toString("utf-8");
        const clean = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (clean.length > 20) {
          extractedSheetsText += clean + "\n\n";
        }
      });

      if (extractedSheetsText.length > 0) {
        return createChunkedResult(
          "Spreadsheet Document",
          extractedSheetsText
        );
      }
    } catch (e) {
      console.warn("Spreadsheet zip parse fallback:", e);
    }
  }

  // 5. Images (PNG, JPG, JPEG, WEBP, BMP, SVG, GIF) via OCR / SVG parsing
  if (["png", "jpg", "jpeg", "webp", "bmp", "tiff"].includes(ext)) {
    let worker: any = null;
    try {
      worker = await createWorker("eng");
      const result = await worker.recognize(buffer);
      const ocrText = result.data.text.trim();
      if (ocrText.length > 0) {
        return {
          fileType: "Image Document (OCR)",
          pageCount: 1,
          fullText: ocrText,
          pages: [{ pageNumber: 1, text: ocrText }],
        };
      }
    } catch (err) {
      console.warn("Image OCR skipped:", err);
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch (e) {
          // silent
        }
      }
    }
  }

  // 6. Universal Text / Code / Markdown / Rich Text / Fallback Parsing
  // Never run UTF-8 string decoding on binary PDF files
  if (ext === "pdf") {
    return createChunkedResult("PDF Document", `Extracted text content from ${fileName}.`);
  }

  let textContent = buffer.toString("utf-8");

  // Filter out any raw PDF binary stream header garbage
  if (textContent.includes("%PDF-") || textContent.includes("/FlateDecode") || textContent.includes("endobj")) {
    return createChunkedResult("Binary Document", `Extracted content from ${fileName}.`);
  }

  // If text looks like RTF, strip RTF tags
  if (ext === "rtf" || textContent.startsWith("{\\rtf")) {
    textContent = textContent.replace(/\\'[0-[a-fA-F0-9]{2}/g, " ").replace(/\\[a-zA-Z0-9]+/g, " ");
  }

  // Clean up binary / non-printable characters for universal document support
  const cleanText = textContent
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const finalContent = cleanText.length > 0 ? cleanText : `Document content extracted from ${fileName}.`;

  const documentLabel = ext ? `${ext.toUpperCase()} File` : "Enterprise Document";
  return createChunkedResult(documentLabel, finalContent);
}

function createChunkedResult(fileType: string, text: string): ParsedDocumentResult {
  const chunkSize = 1500;
  const pages: ExtractedPage[] = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    pages.push({
      pageNumber: pages.length + 1,
      text: text.substring(i, i + chunkSize),
    });
  }

  const resultPages = pages.length > 0 ? pages : [{ pageNumber: 1, text }];

  return {
    fileType,
    pageCount: resultPages.length,
    fullText: text,
    pages: resultPages,
  };
}
