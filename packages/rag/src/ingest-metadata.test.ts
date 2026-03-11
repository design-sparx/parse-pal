import test from "node:test";
import assert from "node:assert/strict";

import {
  addDocumentScopeToMetadata,
  buildDocumentScopeFilter,
} from "./vectorstore.ts";

test("document scope metadata is added to chunk metadata", () => {
  const metadata = addDocumentScopeToMetadata(
    {
      page: 3,
      source: "report.pdf",
    },
    {
      conversationId: "conv-123",
      documentId: "doc-456",
      filename: "report.pdf",
    }
  );

  assert.deepEqual(metadata, {
    page: 3,
    source: "report.pdf",
    conversationId: "conv-123",
    documentId: "doc-456",
    filename: "report.pdf",
  });
});

test("retrieval filter uses document id when provided", () => {
  assert.deepEqual(
    buildDocumentScopeFilter({
      conversationId: "conv-123",
      documentId: "doc-456",
    }),
    {
      documentId: "doc-456",
    }
  );
});

test("retrieval filter falls back to conversation id", () => {
  assert.deepEqual(
    buildDocumentScopeFilter({
      conversationId: "conv-123",
    }),
    {
      conversationId: "conv-123",
    }
  );
});

test("retrieval filter is empty when no scope exists", () => {
  assert.equal(buildDocumentScopeFilter({}), undefined);
});
