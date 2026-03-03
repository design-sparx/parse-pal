import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { getVectorStore } from "@parse-pal/rag/vectorstore";
import * as readline from "readline";

const TOP_K = 5;

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

async function chat() {
  console.log("Loading embedding model...");
  let vectorStore: Awaited<ReturnType<typeof getVectorStore>>;
  try {
    vectorStore = await getVectorStore();
  } catch {
    console.error('No documents ingested yet. Run "pnpm ingest <pdf>" first.');
    process.exit(1);
  }

  // Memory: keeps the full conversation history for this session
  const chatHistory: (HumanMessage | AIMessage)[] = [];

  console.log('\nReady! Ask a question (or type "exit" to quit):\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = () => {
    rl.question("You: ", async (question) => {
      if (question.toLowerCase() === "exit") {
        console.log("Bye!");
        rl.close();
        return;
      }

      if (!question.trim()) {
        ask();
        return;
      }

      try {
        // 1. Find relevant chunks via similarity search
        const results = await vectorStore.similaritySearch(question, TOP_K);

        const context = results.map((r) => r.pageContent).join("\n\n---\n\n");

        const sources = results
          .map((r) => `page ${r.metadata.page ?? "?"}`)
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(", ");

        // 2. Build messages array:
        //    [system prompt] + [chat history] + [current question]
        //    This is what gives the LLM memory of the conversation
        const messages = [
          new SystemMessage(
            `You are a helpful assistant. Answer questions using only the context below.
If the answer is not in the context, say "I don't have enough information to answer that."

Context:
${context}`
          ),
          ...chatHistory,
          new HumanMessage(question),
        ];

        // 3. Ask Groq with the full message history
        const response = await llm.invoke(messages);
        const answer = response.content as string;

        // 4. Save this exchange to memory
        chatHistory.push(new HumanMessage(question));
        chatHistory.push(new AIMessage(answer));

        console.log(`\nAssistant: ${answer}`);
        console.log(`\n[Sources: ${sources}]\n`);
      } catch (err) {
        console.error("Error:", err);
      }

      ask();
    });
  };

  ask();
}

chat().catch(console.error);
