import { createEnv } from '@t3-oss/env-nextjs'
import { Schema } from 'effect'

export const env = createEnv({
  server: {
    DATABASE_URL: Schema.standardSchemaV1(
      Schema.String.pipe(
        Schema.startsWith('postgresql://'),
        Schema.annotations({
          title: 'Database URL',
          description: 'PostgreSQL connection string',
        })
      )
    ),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})

export type Env = typeof env

