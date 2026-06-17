/**
 * Run this script whenever cv.pdf is updated:
 *   node scripts/extract-cv.mjs
 */
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(fileURLToPath(import.meta.url), "..", "..");

const pdfPath = path.join(root, "data", "cv.pdf");
const outPath = path.join(root, "data", "cv.txt");

const buffer = fs.readFileSync(pdfPath);
const uint8 = new Uint8Array(buffer);
const doc = await getDocument({ data: uint8 }).promise;

let text = "";
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  text += content.items.map((item) => item.str).join(" ") + "\n";
}

fs.writeFileSync(outPath, text, "utf-8");
console.log(`cv.txt updated — ${text.length} characters from ${doc.numPages} pages.`);
