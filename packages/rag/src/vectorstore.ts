import { Chroma } from "@langchain/community/vectorstores/chroma";
import { createEmbeddings } from "./embeddings";
import { getLangChainChromaArgs } from "./chroma-config";

export { COLLECTION_NAME } from "./chroma-config";

export async function getVectorStore() {
  const embeddings = createEmbeddings();
  return Chroma.fromExistingCollection(embeddings, getLangChainChromaArgs());
}
