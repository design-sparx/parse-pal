import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { createEmbeddings } from "./embeddings";
import { getLangChainChromaArgs } from "./chroma-config";
import { addDocumentScopeToMetadata, type DocumentScope } from "./vectorstore";

type PrimitiveMetadata = Record<string, string | number | boolean | null>;

function sanitizeMetadata(metadata: Record<string, unknown>): PrimitiveMetadata {
  return Object.fromEntries(
    Object.entries(metadata).filter(
      ([_, v]) => v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean"
    )
  ) as PrimitiveMetadata;
}

export async function ingestPDF(filePath: string, scope: DocumentScope = {}) {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const rawChunks = await splitter.splitDocuments(docs);

  const chunks = rawChunks.map((doc) => ({
    ...doc,
    metadata: addDocumentScopeToMetadata(sanitizeMetadata(doc.metadata), scope),
  }));
  const previewText = chunks
    .slice(0, 3)
    .map((chunk) => chunk.pageContent)
    .join("\n\n")
    .slice(0, 4000);

  const embeddings = await createEmbeddings();
  await Chroma.fromDocuments(chunks, embeddings, getLangChainChromaArgs());

  return { pages: docs.length, chunks: chunks.length, previewText };
}
