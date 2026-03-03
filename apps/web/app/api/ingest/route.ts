import { NextRequest, NextResponse } from "next/server";
import { ingestPDF } from "@parse-pal/rag/ingest";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.name.endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  // Write the uploaded file to a temp path so LangChain's PDFLoader can read it
  const bytes = await file.arrayBuffer();
  const tmpPath = join(tmpdir(), `parse-pal-${Date.now()}.pdf`);
  await writeFile(tmpPath, Buffer.from(bytes));

  const { pages, chunks } = await ingestPDF(tmpPath);

  return NextResponse.json({ success: true, pages, chunks, filename: file.name });
}
