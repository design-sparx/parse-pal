import { getDatabaseClient, type Document } from "../db"

type CreateDocumentInput = {
  id: string
  conversationId: string
  cloudinaryPublicId: string
  cloudinaryUrl: string
  filename: string
  mimeType: string
  fileSize: number
}

type UpdateDocumentProcessingResultInput = {
  id: string
  summary: string
  pageCount: number
  chunkCount: number
}

function mapDocumentRow(row: {
  id: string
  conversation_id: string
  cloudinary_public_id: string
  cloudinary_url: string
  filename: string
  mime_type: string
  file_size: number
  summary: string | null
  page_count: number | null
  chunk_count: number | null
  created_at: Date | string
}): Document {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    cloudinaryPublicId: row.cloudinary_public_id,
    cloudinaryUrl: row.cloudinary_url,
    filename: row.filename,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    summary: row.summary,
    pageCount: row.page_count,
    chunkCount: row.chunk_count,
    createdAt: new Date(row.created_at).toISOString(),
  }
}

export function createServerDocumentRepository(sql = getDatabaseClient()) {
  return {
    async create(input: CreateDocumentInput) {
      const rows = await sql`
        insert into documents (
          id,
          conversation_id,
          cloudinary_public_id,
          cloudinary_url,
          filename,
          mime_type,
          file_size
        )
        values (
          ${input.id},
          ${input.conversationId},
          ${input.cloudinaryPublicId},
          ${input.cloudinaryUrl},
          ${input.filename},
          ${input.mimeType},
          ${input.fileSize}
        )
        returning
          id,
          conversation_id,
          cloudinary_public_id,
          cloudinary_url,
          filename,
          mime_type,
          file_size,
          summary,
          page_count,
          chunk_count,
          created_at
      ` as {
        id: string
        conversation_id: string
        cloudinary_public_id: string
        cloudinary_url: string
        filename: string
        mime_type: string
        file_size: number
        summary: string | null
        page_count: number | null
        chunk_count: number | null
        created_at: Date | string
      }[]

      return mapDocumentRow(rows[0])
    },

    async getById(id: string) {
      const rows = await sql`
        select
          id,
          conversation_id,
          cloudinary_public_id,
          cloudinary_url,
          filename,
          mime_type,
          file_size,
          summary,
          page_count,
          chunk_count,
          created_at
        from documents
        where id = ${id}
        limit 1
      ` as {
        id: string
        conversation_id: string
        cloudinary_public_id: string
        cloudinary_url: string
        filename: string
        mime_type: string
        file_size: number
        summary: string | null
        page_count: number | null
        chunk_count: number | null
        created_at: Date | string
      }[]

      return rows[0] ? mapDocumentRow(rows[0]) : null
    },

    async getByConversationId(conversationId: string) {
      const rows = await sql`
        select
          id,
          conversation_id,
          cloudinary_public_id,
          cloudinary_url,
          filename,
          mime_type,
          file_size,
          summary,
          page_count,
          chunk_count,
          created_at
        from documents
        where conversation_id = ${conversationId}
        order by created_at asc
        limit 1
      ` as {
        id: string
        conversation_id: string
        cloudinary_public_id: string
        cloudinary_url: string
        filename: string
        mime_type: string
        file_size: number
        summary: string | null
        page_count: number | null
        chunk_count: number | null
        created_at: Date | string
      }[]

      return rows[0] ? mapDocumentRow(rows[0]) : null
    },

    async markReady(input: UpdateDocumentProcessingResultInput) {
      const rows = await sql`
        update documents
        set
          summary = ${input.summary},
          page_count = ${input.pageCount},
          chunk_count = ${input.chunkCount}
        where id = ${input.id}
        returning
          id,
          conversation_id,
          cloudinary_public_id,
          cloudinary_url,
          filename,
          mime_type,
          file_size,
          summary,
          page_count,
          chunk_count,
          created_at
      ` as {
        id: string
        conversation_id: string
        cloudinary_public_id: string
        cloudinary_url: string
        filename: string
        mime_type: string
        file_size: number
        summary: string | null
        page_count: number | null
        chunk_count: number | null
        created_at: Date | string
      }[]

      return mapDocumentRow(rows[0])
    },
  }
}
