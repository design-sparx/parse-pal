import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChromaClient } from "chromadb";
import { createEmbeddings } from "./embeddings";
import { COLLECTION_NAME, CHROMA_URL } from "./vectorstore";

type PrimitiveMetadata = Record<string, string | number | boolean | null>;

function sanitizeMetadata(metadata: Record<string, unknown>): PrimitiveMetadata {
  return Object.fromEntries(
    Object.entries(metadata).filter(
      ([_, v]) => v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean"
    )
  ) as PrimitiveMetadata;
}

export async function ingestPDF(filePath: string) {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const rawChunks = await splitter.splitDocuments(docs);

  const chunks = rawChunks.map((doc) => ({
    ...doc,
    metadata: sanitizeMetadata(doc.metadata),
  }));

  // Clear existing collection
  const client = new ChromaClient({ host: "localhost", port: 8000 });
  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
  } catch {
    // Didn't exist yet
  }

  const embeddings = createEmbeddings();
  await Chroma.fromDocuments(chunks, embeddings, {
    collectionName: COLLECTION_NAME,
    url: CHROMA_URL,
  });

  return { pages: docs.length, chunks: chunks.length };
}
