// utils/extractResumeText.ts
import mammoth from "mammoth";
const PDFExtract = require("pdf.js-extract").PDFExtract;

const extractPdfText = async (buffer: Buffer): Promise<string> => {
  try {
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extractBuffer(buffer);

    let text = "";
    data.pages.forEach((page: any) => {
      page.content.forEach((item: any) => {
        if (item.str) {
          text += item.str + " ";
        }
      });
      text += "\n";
    });

    return text.trim();
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

export const extractResumeText = async (
  file: Express.Multer.File
): Promise<string> => {
  const { mimetype, buffer } = file;

  if (mimetype === "application/pdf") {
    return await extractPdfText(buffer);
  }

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimetype === "text/plain") {
    return buffer.toString("utf-8");
  }

  throw new Error("Unsupported file type");
};
