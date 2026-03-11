import test from "node:test"
import assert from "node:assert/strict"

import { deleteConversationResources } from "./delete-conversation.ts"

test("deletion succeeds even when external cleanup reports warnings", async () => {
  const calls: string[] = []

  const result = await deleteConversationResources({
    conversationId: "conv-1",
    documentId: "doc-1",
    cloudinaryPublicId: "parse-pal/doc-1",
    deleteCloudinaryAsset: async () => {
      calls.push("cloudinary")
      throw new Error("cloudinary timeout")
    },
    deleteChromaEntries: async () => {
      calls.push("chroma")
      throw new Error("chroma rate limit")
    },
    deleteConversationRow: async () => {
      calls.push("neon")
    },
  })

  assert.deepEqual(calls, ["cloudinary", "chroma", "neon"])
  assert.equal(result.ok, true)
  assert.deepEqual(result.warnings, ["cloudinary timeout", "chroma rate limit"])
})

test("deletion works cleanly when all resource cleanup succeeds", async () => {
  const result = await deleteConversationResources({
    conversationId: "conv-1",
    documentId: "doc-1",
    cloudinaryPublicId: "parse-pal/doc-1",
    deleteCloudinaryAsset: async () => undefined,
    deleteChromaEntries: async () => undefined,
    deleteConversationRow: async () => undefined,
  })

  assert.deepEqual(result, {
    ok: true,
    warnings: [],
  })
})
