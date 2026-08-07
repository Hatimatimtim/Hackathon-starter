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

  // 1. PDF Documents
  if (ext === "pdf") {
    const res = await processPDFDocument(buffer);
    return {
      fileType: "PDF Document",
      pageCount: res.pageCount,
      fullText: res.fullText,
      pages: res.pages,
    };
  }

  // 2. PowerPoint (.pptx) Presentations
  if (ext === "pptx" || ext === "ppt") {
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

  // 3. Word Documents (.docx)
  if (ext === "docx" || ext === "doc") {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const rawText = result.value.trim();
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
    } catch (err) {
      console.warn("Mammoth DOCX parsing failed:", err);
    }
  }

  // 4. Images (PNG, JPG, JPEG, WEBP, BMP) via OCR
  if (["png", "jpg", "jpeg", "webp", "bmp"].includes(ext)) {
    let worker: any = null;
    try {
      worker = await createWorker("eng");
      const result = await worker.recognize(buffer);
      const ocrText = result.data.text.trim();
      return {
        fileType: "Image (OCR)",
        pageCount: 1,
        fullText: ocrText,
        pages: [{ pageNumber: 1, text: ocrText }],
      };
    } catch (err) {
      console.warn("Image OCR failed:", err);
    } finally {
      if (worker) await worker.terminate();
    }
  }

  // 5. Plain Text / Markdown / CSV / JSON / Code Files
  const textContent = buffer
    .toString("utf-8")
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .trim();

  // Split into chunks if text is long
  const chunkSize = 1500;
  const pages: ExtractedPage[] = [];
  for (let i = 0; i < textContent.length; i += chunkSize) {
    pages.push({
      pageNumber: pages.length + 1,
      text: textContent.substring(i, i + chunkSize),
    });
  }

  return {
    fileType: ext.toUpperCase() + " Document",
    pageCount: Math.max(1, pages.length),
    fullText: textContent,
    pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: textContent }],
  };
}
