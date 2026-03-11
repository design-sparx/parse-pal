type Env = NodeJS.ProcessEnv | Record<string, string | undefined>

type OptionalServerConfig = {
  groqApiKey: string | null
  databaseUrl: string | null
  cloudinaryCloudName: string | null
  cloudinaryApiKey: string | null
  cloudinaryApiSecret: string | null
}

type CloudinaryConfig = {
  cloudName: string
  apiKey: string
  apiSecret: string
}

export function getOptionalServerConfig(env: Env = process.env): OptionalServerConfig {
  return {
    groqApiKey: env.GROQ_API_KEY ?? null,
    databaseUrl: env.DATABASE_URL ?? null,
    cloudinaryCloudName: env.CLOUDINARY_CLOUD_NAME ?? null,
    cloudinaryApiKey: env.CLOUDINARY_API_KEY ?? null,
    cloudinaryApiSecret: env.CLOUDINARY_API_SECRET ?? null,
  }
}

export function getDatabaseUrl(env: Env = process.env) {
  const databaseUrl = env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required")
  }

  return databaseUrl
}

export function getCloudinaryConfig(env: Env = process.env): CloudinaryConfig {
  const cloudName = env.CLOUDINARY_CLOUD_NAME
  const apiKey = env.CLOUDINARY_API_KEY
  const apiSecret = env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary configuration is incomplete")
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  }
}
