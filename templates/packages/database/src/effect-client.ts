import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { PgClient } from '@effect/sql-pg'
import { Config, Layer } from 'effect'

const MAX_CONNECTIONS_DEV = 1
const MAX_CONNECTIONS_PROD = 8

const maxConnections =
  process.env.NODE_ENV === 'development' ? MAX_CONNECTIONS_DEV : MAX_CONNECTIONS_PROD
const timeoutMs = 10_000

const PgLive = PgClient.layerConfig({
  url: Config.redacted('DATABASE_URL'),
  ssl: Config.succeed(false),
  maxConnections: Config.succeed(maxConnections),
  connectTimeout: Config.succeed(timeoutMs),
  idleTimeout: Config.succeed(timeoutMs),
})

const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(PgLive))

export const DatabaseLive = Layer.mergeAll(PgLive, DrizzleLive)
