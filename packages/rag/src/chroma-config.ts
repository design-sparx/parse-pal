import { ChromaClient, CloudClient } from "chromadb";

export const COLLECTION_NAME = "pdf_docs";
const DEFAULT_CHROMA_URL = "http://localhost:8000";

type Env = NodeJS.ProcessEnv | Record<string, string | undefined>;

export type LocalChromaConfig = {
  mode: "local";
  url: string;
  host: string;
  port: number;
  collectionName: typeof COLLECTION_NAME;
};

export type CloudChromaConfig = {
  mode: "cloud";
  apiKey: string;
  tenant: string;
  database: string;
  collectionName: typeof COLLECTION_NAME;
};

export type ChromaConfig = LocalChromaConfig | CloudChromaConfig;

export function getChromaConfig(env: Env = process.env): ChromaConfig {
  const apiKey = env.CHROMA_API_KEY;
  const tenant = env.CHROMA_TENANT;
  const database = env.CHROMA_DATABASE;

  if (apiKey && tenant && database) {
    return {
      mode: "cloud",
      apiKey,
      tenant,
      database,
      collectionName: COLLECTION_NAME,
    };
  }

  const url = env.CHROMA_URL ?? DEFAULT_CHROMA_URL;
  const parsed = new URL(url);
  const host = parsed.hostname;
  const port = parsed.port ? Number(parsed.port) : parsed.protocol === "https:" ? 443 : 80;

  return {
    mode: "local",
    url,
    host,
    port,
    collectionName: COLLECTION_NAME,
  };
}

export function createChromaClient(env: Env = process.env) {
  const config = getChromaConfig(env);

  if (config.mode === "cloud") {
    return new CloudClient({
      apiKey: config.apiKey,
      tenant: config.tenant,
      database: config.database,
    });
  }

  return new ChromaClient({
    host: config.host,
    port: config.port,
    ssl: config.url.startsWith("https://"),
  });
}

export function getLangChainChromaArgs(env: Env = process.env) {
  const config = getChromaConfig(env);

  if (config.mode === "cloud") {
    return {
      collectionName: config.collectionName,
      index: createChromaClient(env),
    };
  }

  return {
    collectionName: config.collectionName,
    url: config.url,
  };
}
