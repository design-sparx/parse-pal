import { v2 as cloudinary } from "cloudinary"
import { getCloudinaryConfig } from "./env"

type Env = NodeJS.ProcessEnv | Record<string, string | undefined>

type CreateSignedUploadParamsOptions = {
  folder?: string
  timestamp?: number
}

export function createSignedUploadParams(
  env: Env = process.env,
  options: CreateSignedUploadParamsOptions = {}
) {
  const config = getCloudinaryConfig(env)
  const timestamp = options.timestamp ?? Math.floor(Date.now() / 1000)
  const folder = options.folder ?? "parse-pal"
  const paramsToSign = {
    folder,
    timestamp,
  }

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    folder,
    timestamp,
    resourceType: "raw" as const,
    signature: cloudinary.utils.api_sign_request(paramsToSign, config.apiSecret),
  }
}

export function getCloudinaryUploadUrl(cloudName: string, resourceType = "raw") {
  return `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
}
