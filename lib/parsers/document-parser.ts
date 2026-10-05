export const runtime = "nodejs";

import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export interface ParsedDocument {
  text: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export async function parseDocument(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ParsedDocument> {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 5MB limit.");
  }

  let extractedText = "";

  const isPdf =
    mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
  const isDocx =
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx");
  const isTxt =
    mimeType === "text/plain" || fileName.toLowerCase().endsWith(".txt");

  if (isPdf) {
    try {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse PDF document: ${msg}`);
    }
  } else if (isDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse DOCX document: ${msg}`);
    }
  } else if (isTxt) {
    extractedText = buffer.toString("utf-8");
  } else {
    throw new Error(
      "Unsupported file format. Only PDF (.pdf) and Word (.docx) files are supported."
    );
  }

  if (!extractedText || extractedText.trim().length === 0) {
    throw new Error("Extracted document text is empty.");
  }

  return {
    text: extractedText,
    fileName,
    fileSize: buffer.length,
    mimeType,
  };
}
