import test from "node:test";
import assert from "node:assert/strict";
import { getChromaConfig } from "./chroma-config.ts";

test("uses local chroma defaults when cloud env vars are not set", () => {
  const config = getChromaConfig({});

  assert.deepEqual(config, {
    mode: "local",
    url: "http://localhost:8000",
    host: "localhost",
    port: 8000,
    collectionName: "pdf_docs",
  });
});

test("uses chroma cloud when all cloud env vars are present", () => {
  const config = getChromaConfig({
    CHROMA_API_KEY: "key",
    CHROMA_TENANT: "tenant",
    CHROMA_DATABASE: "db",
  });

  assert.deepEqual(config, {
    mode: "cloud",
    apiKey: "key",
    tenant: "tenant",
    database: "db",
    collectionName: "pdf_docs",
  });
});

test("uses a custom local url when CHROMA_URL is set", () => {
  const config = getChromaConfig({
    CHROMA_URL: "http://127.0.0.1:9000",
  });

  assert.deepEqual(config, {
    mode: "local",
    url: "http://127.0.0.1:9000",
    host: "127.0.0.1",
    port: 9000,
    collectionName: "pdf_docs",
  });
});
