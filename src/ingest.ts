import "dotenv/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { ChromaClient } from "chromadb";
import path from "path";
import fs from "fs";

const PDF_PATH = process.argv[2];
const COLLECTION_NAME = "pdf_docs";

if (!PDF_PATH) {
  console.error("Usage: pnpm ingest <path-to-pdf>");
  process.exit(1);
}

if (!fs.existsSync(PDF_PATH)) {
  console.error(`File not found: ${PDF_PATH}`);
  process.exit(1);
}

// ChromaDB v3 only accepts primitive metadata values (string, number, boolean, null)
// PDFLoader adds nested objects like { pdf: {...}, loc: {...} } — strip them out
function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, string | number | boolean | null> {
  return Object.fromEntries(
    Object.entries(metadata).filter(
      ([_, v]) => v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean"
    )
  ) as Record<string, string | number | boolean | null>;
}

async function ingest() {
  console.log(`\nLoading PDF: ${PDF_PATH}`);

  // 1. Load the PDF
  const loader = new PDFLoader(PDF_PATH);
  const docs = await loader.load();
  console.log(`Loaded ${docs.length} page(s)`);

  // 2. Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const rawChunks = await splitter.splitDocuments(docs);

  // 3. Sanitize metadata — remove any nested objects ChromaDB can't store
  const chunks = rawChunks.map((doc) => ({
    ...doc,
    metadata: sanitizeMetadata(doc.metadata),
  }));
  console.log(`Split into ${chunks.length} chunks`);

  // 4. Delete stale collection if it exists (fresh ingest each time)
  const chromaClient = new ChromaClient({ host: "localhost", port: 8000 });
  try {
    await chromaClient.deleteCollection({ name: COLLECTION_NAME });
    console.log("Cleared existing collection");
  } catch {
    // Collection didn't exist yet
  }

  // 5. Create embedding model (runs locally, no API key needed)
  //    First run will download ~25MB model — cached after that
  console.log("Loading embedding model (downloads on first run)...");
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });

  // 6. Embed chunks and store in ChromaDB
  console.log("Embedding and storing chunks...");
  await Chroma.fromDocuments(chunks, embeddings, {
    collectionName: COLLECTION_NAME,
    url: "http://localhost:8000",
  });

  console.log(`\nDone! "${path.basename(PDF_PATH!)}" is ready to query.\n`);
}

ingest().catch(console.error);
