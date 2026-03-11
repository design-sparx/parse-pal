import { after, NextRequest, NextResponse } from "next/server";
import { processIngestJob } from "@/lib/ingest-worker";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    conversationId,
    documentId,
    ingestJobId,
    cloudinaryUrl,
    filename,
  } = body ?? {};

  if (!conversationId || !documentId || !ingestJobId || !cloudinaryUrl || !filename) {
    return NextResponse.json({ error: "Ingest payload is incomplete" }, { status: 400 });
  }

  after(async () => {
    await processIngestJob({
      conversationId,
      documentId,
      ingestJobId,
      cloudinaryUrl,
      filename,
    });
  });

  return NextResponse.json({ queued: true }, { status: 202 });
}
