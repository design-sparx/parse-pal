import test from "node:test"
import assert from "node:assert/strict"

import { createSignedUploadParams } from "./cloudinary.ts"

test("signed upload params include the expected cloudinary fields", () => {
  const params = createSignedUploadParams(
    {
      CLOUDINARY_CLOUD_NAME: "demo-cloud",
      CLOUDINARY_API_KEY: "demo-key",
      CLOUDINARY_API_SECRET: "demo-secret",
    },
    {
      folder: "parse-pal",
      timestamp: 1710000000,
    }
  )

  assert.equal(params.cloudName, "demo-cloud")
  assert.equal(params.apiKey, "demo-key")
  assert.equal(params.folder, "parse-pal")
  assert.equal(params.timestamp, 1710000000)
  assert.equal(params.resourceType, "raw")
  assert.equal(typeof params.signature, "string")
  assert.ok(params.signature.length > 0)
})
