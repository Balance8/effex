import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import type { DrizzleTable } from '../parsers/drizzle-parser.js'

function mapDrizzleTypeToEffect(drizzleType: string) {
  const typeMap: Record<string, string> = {
    text: 'Schema.String',
    varchar: 'Schema.String',
    uuid: 'Schema.String',
    integer: 'Schema.Number',
    serial: 'Schema.Number',
    bigint: 'Schema.BigInt',
    boolean: 'Schema.Boolean',
    timestamp: 'Schema.Date',
    date: 'Schema.Date',
    json: 'Schema.Unknown',
    jsonb: 'Schema.Unknown',
    real: 'Schema.Number',
    doublePrecision: 'Schema.Number',
  }
  return typeMap[drizzleType] || 'Schema.Unknown'
}

function generateSchemaFile(table: DrizzleTable) {
  const selectFields = table.columns
    .map(col => {
      const baseType = mapDrizzleTypeToEffect(col.type)
      const type = !(col.isNotNull || col.isPrimaryKey) ? `Schema.optional(${baseType})` : baseType
      return `  ${col.name}: ${type},`
    })
    .join('\n')

  const insertFields = table.columns
    .filter(col => !(col.isPrimaryKey && col.hasDefault))
    .map(col => {
      const baseType = mapDrizzleTypeToEffect(col.type)
      const isOptional = !col.isNotNull || col.hasDefault
      const type = isOptional ? `Schema.optional(${baseType})` : baseType
      return `  ${col.name}: ${type},`
    })
    .join('\n')

  return `import { Schema } from 'effect'

export const select${table.name}Schema = Schema.Struct({
${selectFields}
})

export const insert${table.name}Schema = Schema.Struct({
${insertFields}
})

export type Select${table.name} = typeof select${table.name}Schema.Type
export type Insert${table.name} = typeof insert${table.name}Schema.Type
`
}

function generateServiceFile(table: DrizzleTable) {
  const tableLower = table.name.toLowerCase()
  const primaryKeyCol = table.columns.find(col => col.isPrimaryKey)

  return `import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { eq } from 'drizzle-orm'
import { Context, Effect, Layer, Schema } from 'effect'

import type { Insert${table.name} } from '@workspace/database/effect/schemas/${tableLower}-schemas'
import { select${table.name}Schema } from '@workspace/database/effect/schemas/${tableLower}-schemas'
import { ${tableLower} } from '@workspace/database/schema'

export class DatabaseError extends Schema.TaggedError<DatabaseError>()('DatabaseError', {
  cause: Schema.Unknown,
}) {}

export class ${table.name}NotFound extends Schema.TaggedError<${table.name}NotFound>()('${table.name}NotFound', {
  id: Schema.String,
}) {}

const make${table.name}Service = Effect.gen(function* () {
  const drizzle = yield* PgDrizzle.PgDrizzle

  return {
    getAll${table.name}s: drizzle
      .select()
      .from(${tableLower})
      .pipe(
        Effect.mapError(error => new DatabaseError({ cause: error })),
        Effect.flatMap(items =>
          Effect.all(items.map(item => Schema.decodeUnknown(select${table.name}Schema)(item)))
        )
      ),

    get${table.name}ById: (id: string) =>
      drizzle
        .select()
        .from(${tableLower})
        .where(eq(${tableLower}.${primaryKeyCol?.name || 'id'}, id))
        .limit(1)
        .pipe(
          Effect.mapError(error => new DatabaseError({ cause: error })),
          Effect.flatMap(result =>
            result[0] ? Effect.succeed(result[0]) : Effect.fail(new ${table.name}NotFound({ id }))
          ),
          Effect.flatMap(item => Schema.decodeUnknown(select${table.name}Schema)(item))
        ),

    create${table.name}: (data: Insert${table.name}) =>
      drizzle
        .insert(${tableLower})
        .values(data)
        .returning()
        .pipe(
          Effect.mapError(error => new DatabaseError({ cause: error })),
          Effect.flatMap(result =>
            result[0]
              ? Effect.succeed(result[0])
              : Effect.fail(new DatabaseError({ cause: 'No item returned after insert' }))
          ),
          Effect.flatMap(item => Schema.decodeUnknown(select${table.name}Schema)(item))
        ),

    update${table.name}: (id: string, data: Partial<Insert${table.name}>) =>
      Effect.gen(function* () {
        const existing = yield* drizzle
          .select()
          .from(${tableLower})
          .where(eq(${tableLower}.${primaryKeyCol?.name || 'id'}, id))
          .limit(1)
          .pipe(
            Effect.mapError(error => new DatabaseError({ cause: error })),
            Effect.flatMap(result =>
              result[0] ? Effect.succeed(result[0]) : Effect.fail(new ${table.name}NotFound({ id }))
            )
          )

        const [updated] = yield* drizzle
          .update(${tableLower})
          .set(data)
          .where(eq(${tableLower}.${primaryKeyCol?.name || 'id'}, id))
          .returning()
          .pipe(
            Effect.mapError(error => new DatabaseError({ cause: error })),
            Effect.flatMap(result =>
              result.length > 0 ? Effect.succeed(result) : Effect.fail(new ${table.name}NotFound({ id }))
            )
          )

        return yield* Schema.decodeUnknown(select${table.name}Schema)(updated)
      }),

    delete${table.name}: (id: string) =>
      Effect.gen(function* () {
        const existing = yield* drizzle
          .select()
          .from(${tableLower})
          .where(eq(${tableLower}.${primaryKeyCol?.name || 'id'}, id))
          .limit(1)
          .pipe(
            Effect.mapError(error => new DatabaseError({ cause: error })),
            Effect.flatMap(result =>
              result[0] ? Effect.succeed(result[0]) : Effect.fail(new ${table.name}NotFound({ id }))
            )
          )

        yield* drizzle
          .delete(${tableLower})
          .where(eq(${tableLower}.${primaryKeyCol?.name || 'id'}, id))
          .pipe(Effect.mapError(error => new DatabaseError({ cause: error })))

        return yield* Schema.decodeUnknown(select${table.name}Schema)(existing)
      }),
  }
})

export class ${table.name}Service extends Context.Tag('${table.name}Service')<
  ${table.name}Service,
  Effect.Effect.Success<typeof make${table.name}Service>
>() {
  static readonly Live = Layer.effect(${table.name}Service, make${table.name}Service)
}
`
}

export function generateDrizzleServices(
  tables: DrizzleTable[],
  schemasDir: string,
  servicesDir: string
) {
  mkdirSync(join(schemasDir, 'schemas'), { recursive: true })
  mkdirSync(servicesDir, { recursive: true })

  for (const table of tables) {
    const schemaFile = generateSchemaFile(table)
    const tableLower = table.name.toLowerCase()
    writeFileSync(join(schemasDir, 'schemas', `${tableLower}-schemas.ts`), schemaFile)

    const serviceFile = generateServiceFile(table)
    writeFileSync(join(servicesDir, `${table.name}Service.ts`), serviceFile)
  }

  console.log(`✅ Generated Effect schemas and services for ${tables.length} tables`)
}
