import { getDatabaseClient, type IngestJob } from "../db"

type CreateIngestJobInput = {
  id: string
  conversationId: string
  documentId: string
}

function mapIngestJobRow(row: {
  id: string
  conversation_id: string
  document_id: string
  status: IngestJob["status"]
  error_message: string | null
  started_at: Date | string | null
  completed_at: Date | string | null
  created_at: Date | string
  updated_at: Date | string
}): IngestJob {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    documentId: row.document_id,
    status: row.status,
    errorMessage: row.error_message,
    startedAt: row.started_at ? new Date(row.started_at).toISOString() : null,
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

export function createServerIngestJobRepository(sql = getDatabaseClient()) {
  return {
    async create(input: CreateIngestJobInput) {
      const rows = await sql`
        insert into ingest_jobs (id, conversation_id, document_id, status)
        values (${input.id}, ${input.conversationId}, ${input.documentId}, 'queued')
        returning
          id,
          conversation_id,
          document_id,
          status,
          error_message,
          started_at,
          completed_at,
          created_at,
          updated_at
      ` as {
        id: string
        conversation_id: string
        document_id: string
        status: IngestJob["status"]
        error_message: string | null
        started_at: Date | string | null
        completed_at: Date | string | null
        created_at: Date | string
        updated_at: Date | string
      }[]

      return mapIngestJobRow(rows[0])
    },

    async getById(id: string) {
      const rows = await sql`
        select
          id,
          conversation_id,
          document_id,
          status,
          error_message,
          started_at,
          completed_at,
          created_at,
          updated_at
        from ingest_jobs
        where id = ${id}
        limit 1
      ` as {
        id: string
        conversation_id: string
        document_id: string
        status: IngestJob["status"]
        error_message: string | null
        started_at: Date | string | null
        completed_at: Date | string | null
        created_at: Date | string
        updated_at: Date | string
      }[]

      return rows[0] ? mapIngestJobRow(rows[0]) : null
    },

    async markProcessing(id: string) {
      const rows = await sql`
        update ingest_jobs
        set
          status = 'processing',
          started_at = coalesce(started_at, now()),
          updated_at = now()
        where id = ${id}
        returning
          id,
          conversation_id,
          document_id,
          status,
          error_message,
          started_at,
          completed_at,
          created_at,
          updated_at
      ` as {
        id: string
        conversation_id: string
        document_id: string
        status: IngestJob["status"]
        error_message: string | null
        started_at: Date | string | null
        completed_at: Date | string | null
        created_at: Date | string
        updated_at: Date | string
      }[]

      return mapIngestJobRow(rows[0])
    },

    async markReady(id: string) {
      const rows = await sql`
        update ingest_jobs
        set
          status = 'ready',
          completed_at = now(),
          updated_at = now()
        where id = ${id}
        returning
          id,
          conversation_id,
          document_id,
          status,
          error_message,
          started_at,
          completed_at,
          created_at,
          updated_at
      ` as {
        id: string
        conversation_id: string
        document_id: string
        status: IngestJob["status"]
        error_message: string | null
        started_at: Date | string | null
        completed_at: Date | string | null
        created_at: Date | string
        updated_at: Date | string
      }[]

      return mapIngestJobRow(rows[0])
    },

    async markFailed(id: string, errorMessage: string) {
      const rows = await sql`
        update ingest_jobs
        set
          status = 'failed',
          error_message = ${errorMessage},
          completed_at = now(),
          updated_at = now()
        where id = ${id}
        returning
          id,
          conversation_id,
          document_id,
          status,
          error_message,
          started_at,
          completed_at,
          created_at,
          updated_at
      ` as {
        id: string
        conversation_id: string
        document_id: string
        status: IngestJob["status"]
        error_message: string | null
        started_at: Date | string | null
        completed_at: Date | string | null
        created_at: Date | string
        updated_at: Date | string
      }[]

      return mapIngestJobRow(rows[0])
    },
  }
}
