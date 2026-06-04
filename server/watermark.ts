/**
 * WAVV PDF Watermarking
 *
 * Stamps every page of a PDF with:
 *   - Header band: dark navy bar across the top with "WAVV" label + document type
 *   - Footer mark: "///W" text at 15% opacity in the bottom-right corner
 *
 * Returns the watermarked PDF as a Buffer.
 */

import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

export type DocumentType =
  | "Help Article"
  | "Playbook"
  | "Quick Reference"
  | "Release Notes"
  | "Guide"
  | "Resource"
  | "";

/**
 * Apply WAVV watermark to a PDF buffer.
 * @param pdfBuffer  Original PDF bytes
 * @param documentType  Label shown in the header band (e.g. "Playbook")
 * @returns  Watermarked PDF bytes
 */
export async function applyPdfWatermark(
  pdfBuffer: Buffer,
  documentType: DocumentType = ""
): Promise<Buffer<ArrayBuffer>> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontLight = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Header band height
  const BAND_H = 22;
  // Navy color (WAVV brand dark)
  const NAVY = rgb(0.04, 0.09, 0.18);
  // White
  const WHITE = rgb(1, 1, 1);
  // Light gray for footer mark
  const MARK_OPACITY = 0.12;

  const typeLabel = documentType ? ` · ${documentType}` : "";

  for (const page of pages) {
    const { width, height } = page.getSize();

    // ── Header band ──────────────────────────────────────────────────────────
    // Draw the navy rectangle at the very top
    page.drawRectangle({
      x: 0,
      y: height - BAND_H,
      width,
      height: BAND_H,
      color: NAVY,
      opacity: 1,
    });

    // "WAVV" bold label
    const wavvText = "WAVV";
    const wavvFontSize = 10;
    page.drawText(wavvText, {
      x: 10,
      y: height - BAND_H + 6,
      size: wavvFontSize,
      font,
      color: WHITE,
      opacity: 1,
    });

    // Document type label (lighter weight)
    if (typeLabel) {
      const typeFontSize = 9;
      const wavvWidth = font.widthOfTextAtSize(wavvText, wavvFontSize);
      page.drawText(typeLabel, {
        x: 10 + wavvWidth + 1,
        y: height - BAND_H + 6.5,
        size: typeFontSize,
        font: fontLight,
        color: WHITE,
        opacity: 0.85,
      });
    }

    // Right side: "wavv.com" subtle label
    const siteText = "wavv.com";
    const siteFontSize = 8;
    const siteWidth = fontLight.widthOfTextAtSize(siteText, siteFontSize);
    page.drawText(siteText, {
      x: width - siteWidth - 10,
      y: height - BAND_H + 7,
      size: siteFontSize,
      font: fontLight,
      color: WHITE,
      opacity: 0.6,
    });

    // ── Footer ///W diagonal mark ─────────────────────────────────────────────
    // Large semi-transparent "///W" text at bottom-right
    const footerText = "///W";
    const footerSize = 36;
    const footerWidth = font.widthOfTextAtSize(footerText, footerSize);
    page.drawText(footerText, {
      x: width - footerWidth - 16,
      y: 14,
      size: footerSize,
      font,
      color: rgb(0.04, 0.09, 0.18),
      opacity: MARK_OPACITY,
    });
  }

  const watermarkedBytes = await pdfDoc.save();
  return Buffer.from(watermarkedBytes) as Buffer<ArrayBuffer>;
}
