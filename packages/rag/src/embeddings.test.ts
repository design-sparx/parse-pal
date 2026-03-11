import test from "node:test";
import assert from "node:assert/strict";

import { createEmbeddings } from "./embeddings.ts";

test("createEmbeddings loads the local Hugging Face embedding path", async () => {
  const embeddings = await createEmbeddings();

  assert.equal(typeof embeddings.embedDocuments, "function");
  assert.equal(typeof embeddings.embedQuery, "function");
});
