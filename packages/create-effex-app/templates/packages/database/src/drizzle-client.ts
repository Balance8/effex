import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './generated/drizzle/schema'

const globalForDrizzle = global as unknown as {
  pool: Pool
  db: ReturnType<typeof drizzle>
}

export const pool =
  globalForDrizzle.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  })

export const db = globalForDrizzle.db || drizzle({ client: pool, schema })

if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.pool = pool
  globalForDrizzle.db = db
}

export type DatabaseClient = typeof db
export type DatabasePool = typeof pool

export { schema as drizzleSchema }

