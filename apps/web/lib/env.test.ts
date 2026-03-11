import test from "node:test"
import assert from "node:assert/strict"

import {
  getCloudinaryConfig,
  getDatabaseUrl,
  getOptionalServerConfig,
} from "./env.ts"

test("optional server config preserves local-only operation when hosted env vars are absent", () => {
  const config = getOptionalServerConfig({
    GROQ_API_KEY: "groq-key",
  })

  assert.deepEqual(config, {
    groqApiKey: "groq-key",
    databaseUrl: null,
    cloudinaryCloudName: null,
    cloudinaryApiKey: null,
    cloudinaryApiSecret: null,
  })
})

test("database url is required when the database helper is used", () => {
  assert.throws(
    () => getDatabaseUrl({}),
    /DATABASE_URL is required/
  )
})

test("cloudinary config is required when the upload helper is used", () => {
  assert.throws(
    () => getCloudinaryConfig({}),
    /Cloudinary configuration is incomplete/
  )
})

test("cloudinary config is returned when all required vars exist", () => {
  const config = getCloudinaryConfig({
    CLOUDINARY_CLOUD_NAME: "demo-cloud",
    CLOUDINARY_API_KEY: "api-key",
    CLOUDINARY_API_SECRET: "api-secret",
  })

  assert.deepEqual(config, {
    cloudName: "demo-cloud",
    apiKey: "api-key",
    apiSecret: "api-secret",
  })
})
