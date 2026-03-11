import { Chroma } from "@langchain/community/vectorstores/chroma";
import { createEmbeddings } from "./embeddings";
import { getLangChainChromaArgs } from "./chroma-config";

export { COLLECTION_NAME } from "./chroma-config";

export type DocumentScope = {
  conversationId?: string;
  documentId?: string;
  filename?: string;
};

type ChunkMetadata = Record<string, string | number | boolean | null>;
type DocumentScopeFilter = Record<string, string>;

export function addDocumentScopeToMetadata(metadata: ChunkMetadata, scope: DocumentScope): ChunkMetadata {
  return {
    ...metadata,
    ...(scope.conversationId ? { conversationId: scope.conversationId } : {}),
    ...(scope.documentId ? { documentId: scope.documentId } : {}),
    ...(scope.filename ? { filename: scope.filename } : {}),
  };
}

export function buildDocumentScopeFilter(scope: DocumentScope): DocumentScopeFilter | undefined {
  if (scope.documentId) {
    return { documentId: scope.documentId };
  }

  if (scope.conversationId) {
    return { conversationId: scope.conversationId };
  }

  return undefined;
}

export async function getVectorStore() {
  const embeddings = await createEmbeddings();
  return Chroma.fromExistingCollection(embeddings, getLangChainChromaArgs());
}
