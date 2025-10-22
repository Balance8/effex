import { PgClient } from '@effect/sql-pg'
import { drizzle } from 'drizzle-orm/postgres-js'
import { Config, Effect, Layer } from 'effect'
import postgres from 'postgres'

import * as schema from './schema'

const MAX_CONNECTIONS_DEV = 1
const MAX_CONNECTIONS_PROD = 8

const maxConnections =
  process.env.NODE_ENV === 'development' ? MAX_CONNECTIONS_DEV : MAX_CONNECTIONS_PROD
const timeoutMs = 10_000

export const SqlLive = PgClient.layerConfig({
  url: Config.redacted('DATABASE_URL'),
  ssl: Config.succeed(false),
  maxConnections: Config.succeed(maxConnections),
  connectTimeout: Config.succeed(timeoutMs),
  idleTimeout: Config.succeed(timeoutMs),
})

export class DrizzleService extends Effect.Service<DrizzleService>()('DrizzleService', {
  effect: Effect.gen(function* () {
    const databaseUrl = yield* Config.redacted('DATABASE_URL')
    const url = databaseUrl.value as string

    const client = postgres(url, {
      max: maxConnections,
      idle_timeout: timeoutMs / 1000,
      connect_timeout: timeoutMs / 1000,
    })

    const db = drizzle(client, { schema, casing: 'snake_case' })

    return { db, client }
  }),
  dependencies: [],
}) {}

export const DatabaseLive = DrizzleService.Default
