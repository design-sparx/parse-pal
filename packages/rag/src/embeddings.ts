type EmbeddingsLike = {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
};

const LOCAL_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
export async function createEmbeddings(): Promise<EmbeddingsLike> {
  const { HuggingFaceTransformersEmbeddings } = await import(
    "@langchain/community/embeddings/huggingface_transformers"
  );

  return new HuggingFaceTransformersEmbeddings({
    model: LOCAL_MODEL,
  });
}
