import { NextRequest } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { buildDocumentScopeFilter, getVectorStore } from "@parse-pal/rag/vectorstore";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, conversationId, documentId } = await req.json();
  const lastMessage = messages[messages.length - 1];

  // 1. Retrieve relevant chunks from ChromaDB
  const vectorStore = await getVectorStore();
  const results = await vectorStore.similaritySearch(
    lastMessage.content,
    5,
    buildDocumentScopeFilter({ conversationId, documentId })
  );
  const context = results.map((r) => r.pageContent).join("\n\n---\n\n");

  // 2. Stream response using Vercel AI SDK + Groq
  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are a helpful assistant. Answer questions using only the context below.
If the answer is not in the context, say "I don't have enough information to answer that."

Context:
${context}`,
    messages,
  });

  return result.toDataStreamResponse();
}
