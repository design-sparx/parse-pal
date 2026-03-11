import { getDatabaseClient, type Conversation } from "../db"

type CreateConversationInput = {
  id: string
  title: string
  status?: Conversation["status"]
}

function mapConversationRow(row: {
  id: string
  title: string
  status: Conversation["status"]
  created_at: Date | string
  updated_at: Date | string
}): Conversation {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

export function createServerConversationRepository(sql = getDatabaseClient()) {
  return {
    async create(input: CreateConversationInput) {
      const rows = await sql`
        insert into conversations (id, title, status)
        values (${input.id}, ${input.title}, ${input.status ?? "queued"})
        returning id, title, status, created_at, updated_at
      ` as {
        id: string
        title: string
        status: Conversation["status"]
        created_at: Date | string
        updated_at: Date | string
      }[]

      return mapConversationRow(rows[0])
    },

    async getById(id: string) {
      const rows = await sql`
        select id, title, status, created_at, updated_at
        from conversations
        where id = ${id}
        limit 1
      ` as {
        id: string
        title: string
        status: Conversation["status"]
        created_at: Date | string
        updated_at: Date | string
      }[]

      return rows[0] ? mapConversationRow(rows[0]) : null
    },

    async updateStatus(id: string, status: Conversation["status"]) {
      const rows = await sql`
        update conversations
        set status = ${status}, updated_at = now()
        where id = ${id}
        returning id, title, status, created_at, updated_at
      ` as {
        id: string
        title: string
        status: Conversation["status"]
        created_at: Date | string
        updated_at: Date | string
      }[]

      return mapConversationRow(rows[0])
    },
  }
}
