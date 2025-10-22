import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { getSchema } from '@mrleebo/prisma-ast'
import { Schema } from 'effect'

const AttributeSchema = Schema.Struct({
  name: Schema.String,
})

const FieldSchema = Schema.Struct({
  name: Schema.String,
  fieldType: Schema.String,
  optional: Schema.Boolean,
  array: Schema.Boolean,
  type: Schema.String,
  attributes: Schema.optional(Schema.Array(AttributeSchema)),
})

const ModelSchema = Schema.Struct({
  name: Schema.String,
  type: Schema.String,
  properties: Schema.Array(FieldSchema),
})

const PrismaSchemaSchema = Schema.Struct({
  type: Schema.String,
  list: Schema.Array(Schema.Union(ModelSchema, Schema.Struct({ type: Schema.String }))),
})

type Field = typeof FieldSchema.Type
type Model = typeof ModelSchema.Type
type PrismaSchema = typeof PrismaSchemaSchema.Type

function isPrimaryKey(field: Field) {
  return field.attributes?.some(attr => attr.name === 'id') ?? false
}

function mapPrismaTypeToEffect(prismaType: string, isArray: boolean) {
  const typeMap: Record<string, string> = {
    String: 'Schema.String',
    Int: 'Schema.Number',
    Float: 'Schema.Number',
    Boolean: 'Schema.Boolean',
    DateTime: 'Schema.Date',
    Json: 'Schema.Unknown',
    Bytes: 'Schema.String',
    Decimal: 'Schema.Number',
    BigInt: 'Schema.BigInt',
  }
  const baseType = typeMap[prismaType] || 'Schema.Unknown'
  return isArray ? `Schema.Array(${baseType})` : baseType
}

function _generateSelectSchema(model: Model) {
  const fields = model.properties.filter(f => f.type === 'field')
  const selectFieldDefs = fields
    .map(f => {
      const baseType = mapPrismaTypeToEffect(f.fieldType, f.array)
      const type = f.optional ? `Schema.optional(${baseType})` : baseType
      return `  ${f.name}: ${type},`
    })
    .join('\n')

  const insertFields = fields.filter(f => !isPrimaryKey(f))
  const insertFieldDefs = insertFields
    .map(f => {
      const baseType = mapPrismaTypeToEffect(f.fieldType, f.array)
      const type = f.optional ? `Schema.optional(${baseType})` : baseType
      return `  ${f.name}: ${type},`
    })
    .join('\n')

  return `import { Schema } from 'effect'

export const select${model.name}Schema = Schema.Struct({
${selectFieldDefs}
})

export const insert${model.name}Schema = Schema.Struct({
${insertFieldDefs}
})
`
}

function generateServiceFile(model: Model) {
  const modelLower = model.name.toLowerCase()

  return `import { Context, Data, Effect, Layer, Schema } from 'effect'
import { PrismaClient } from '@prisma/client'

import { insert${model.name}Schema, select${model.name}Schema } from '@workspace/database/effect/schemas/${modelLower}-schemas'

export class DatabaseError extends Data.TaggedError('DatabaseError')<{
  readonly cause: unknown
}> {}

export class ${model.name}NotFound extends Data.TaggedError('${model.name}NotFound')<{
  readonly id: string | number
}> {}

export class ConflictError extends Data.TaggedError('ConflictError')<{
  readonly message: string
  readonly conflictingField?: string
}> {}

const make${model.name}Service = Effect.gen(function* () {
  const prisma = yield* PrismaClient

  return {
    findMany: (args?) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.findMany(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.flatMap(results =>
          Effect.all(
            results.map(result => Schema.decodeUnknown(select${model.name}Schema)(result))
          )
        )
      ),

    findUnique: (args) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.findUnique(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.flatMap(result =>
          result
            ? Schema.decodeUnknown(select${model.name}Schema)(result)
            : Effect.fail(new ${model.name}NotFound({ id: 'unknown' }))
        )
      ),

    findUniqueOrThrow: (args) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.findUniqueOrThrow(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.flatMap(result => Schema.decodeUnknown(select${model.name}Schema)(result))
      ),

    findFirst: (args?) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.findFirst(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.flatMap(result =>
          result
            ? Schema.decodeUnknown(select${model.name}Schema)(result)
            : Effect.fail(new ${model.name}NotFound({ id: 'unknown' }))
        )
      ),

    findFirstOrThrow: (args?) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.findFirstOrThrow(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.flatMap(result => Schema.decodeUnknown(select${model.name}Schema)(result))
      ),

    create: (args) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.create(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.flatMap(result => Schema.decodeUnknown(select${model.name}Schema)(result))
      ),

    createMany: (args) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.createMany(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.map(result => result.count)
      ),

    createManyAndReturn: (args) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.createManyAndReturn(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.flatMap(results =>
          Effect.all(
            results.map(result => Schema.decodeUnknown(select${model.name}Schema)(result))
          )
        )
      ),

    update: (args) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.update(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.flatMap(result => Schema.decodeUnknown(select${model.name}Schema)(result))
      ),

    updateMany: (args) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.updateMany(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.map(result => result.count)
      ),

    updateManyAndReturn: (args) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.updateManyAndReturn(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.flatMap(results =>
          Effect.all(
            results.map(result => Schema.decodeUnknown(select${model.name}Schema)(result))
          )
        )
      ),

    upsert: (args) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.upsert(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.flatMap(result => Schema.decodeUnknown(select${model.name}Schema)(result))
      ),

    delete: (args) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.delete(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.flatMap(result => Schema.decodeUnknown(select${model.name}Schema)(result))
      ),

    deleteMany: (args?) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.deleteMany(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.map(result => result.count)
      ),

    aggregate: (args) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.aggregate(args),
        catch: error => new DatabaseError({ cause: error }),
      }),

    groupBy: (args) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.groupBy(args),
        catch: error => new DatabaseError({ cause: error }),
      }),

    count: (args?) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.count(args),
        catch: error => new DatabaseError({ cause: error }),
      }),

    findManyDistinct: (args?) =>
      Effect.tryPromise({
        try: () => prisma.${modelLower}.findMany(args),
        catch: error => new DatabaseError({ cause: error }),
      }).pipe(
        Effect.flatMap(results =>
          Effect.all(
            results.map(result => Schema.decodeUnknown(select${model.name}Schema)(result))
          )
        )
      ),
  }
})

export class ${model.name}Service extends Context.Tag('${model.name}Service')<
  ${model.name}Service,
  Effect.Effect.Success<typeof make${model.name}Service>
>() {
  static readonly Live = Layer.effect(${model.name}Service, make${model.name}Service)
}
`
}

export function generateEffectServices(schemaPath: string, outputDir: string) {
  const schemaContent = readFileSync(schemaPath, 'utf-8')
  const schema = getSchema(schemaContent) as PrismaSchema

  mkdirSync(join(outputDir, 'schemas'), { recursive: true })
  mkdirSync(join(outputDir, 'services'), { recursive: true })

  const models = schema.list.filter(
    (item): item is Model => (item as { type?: string }).type === 'model'
  )

  for (const model of models) {
    const selectSchemaFile = _generateSelectSchema(model)
    const modelLower = model.name.toLowerCase()
    writeFileSync(join(outputDir, 'schemas', `${modelLower}-schemas.ts`), selectSchemaFile)

    const serviceFile = generateServiceFile(model)
    writeFileSync(join(outputDir, 'services', `${model.name}Service.ts`), serviceFile)
  }

  console.log(`✅ Generated Effect services for ${models.length} models`)
}
