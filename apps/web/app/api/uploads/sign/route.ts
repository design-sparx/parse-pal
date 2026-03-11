import { NextResponse } from "next/server"
import { createSignedUploadParams, getCloudinaryUploadUrl } from "@/lib/cloudinary"

export async function POST() {
  try {
    const payload = createSignedUploadParams()

    return NextResponse.json({
      ...payload,
      uploadUrl: getCloudinaryUploadUrl(payload.cloudName, payload.resourceType),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create upload signature",
      },
      { status: 500 }
    )
  }
}
