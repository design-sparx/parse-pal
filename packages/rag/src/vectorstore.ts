import { Chroma } from "@langchain/community/vectorstores/chroma";
import { createEmbeddings } from "./embeddings";

export const COLLECTION_NAME = "pdf_docs";
export const CHROMA_URL = "http://localhost:8000";

export async function getVectorStore() {
  const embeddings = createEmbeddings();
  return Chroma.fromExistingCollection(embeddings, {
    collectionName: COLLECTION_NAME,
    url: CHROMA_URL,
  });
}
