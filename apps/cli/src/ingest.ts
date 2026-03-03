import "dotenv/config";
import { ingestPDF } from "@parse-pal/rag/ingest";
import path from "path";
import fs from "fs";

const PDF_PATH = process.argv[2];

if (!PDF_PATH) {
  console.error("Usage: pnpm ingest <path-to-pdf>");
  process.exit(1);
}

if (!fs.existsSync(PDF_PATH)) {
  console.error(`File not found: ${PDF_PATH}`);
  process.exit(1);
}

console.log(`\nIngesting: ${PDF_PATH}`);
const { pages, chunks } = await ingestPDF(PDF_PATH);
console.log(`Loaded ${pages} page(s), split into ${chunks} chunks`);
console.log(`Done! "${path.basename(PDF_PATH)}" is ready to query.\n`);
