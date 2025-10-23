#!/usr/bin/env tsx

import * as fs from 'node:fs'
import { Console, Effect, pipe } from 'effect'

const columnPattern = /^(\w+):\s*(\w+)\([^)]*\)(.*)/

const makeConfig = Effect.succeed({
  schemaPath: './src/generated/drizzle/schema.ts',
  outputDir: './src/generated/effect',
})

const readSchemaFile = (path: string) =>
  Effect.try({
    try: () => fs.readFileSync(path, 'utf-8'),
    catch: error => new Error(`Failed to read schema file: ${error}`),
  })

const writeSchemaFile = (path: string, content: string) =>
  Effect.try({
    try: () => {
      const dir = path.substring(0, path.lastIndexOf('/'))
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(path, content, 'utf-8')
    },
    catch: error => new Error(`Failed to write schema file: ${error}`),
  })

type ColumnInfo = {
  name: string
  type: 'text' | 'integer' | 'boolean' | 'timestamp' | 'enum' | 'array' | 'doublePrecision'
  isOptional: boolean
  isArray: boolean
}

type TableInfo = {
  name: string
  columns: ColumnInfo[]
}

const extractTableNames = (schemaContent: string): Effect.Effect<string[], Error> => {
  const tableRegex = /export const (\w+) = pgTable\(/g
  const tableNames: string[] = []

  let match: RegExpExecArray | null = null
  match = tableRegex.exec(schemaContent)
  while (match !== null) {
    const [, exportName] = match
    if (exportName) {
      tableNames.push(exportName)
    }
    match = tableRegex.exec(schemaContent)
  }

  return Effect.succeed(tableNames)
}

const extractTableInfo = (
  schemaContent: string,
  tableName: string
): Effect.Effect<TableInfo, Error> =>
  Effect.gen(function* () {
    const tableRegex = new RegExp(
      `export const ${tableName} = pgTable\\('\\w+', \\{([\\s\\S]*?)\\}, \\(`,
      'g'
    )
    const match = tableRegex.exec(schemaContent)

    if (!match?.[1]) {
      return yield* Effect.fail(new Error(`Could not find table definition for ${tableName}`))
    }

    const columnsText = match[1]
    const columns: ColumnInfo[] = []

    const lines = columnsText.split('\n')

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine === '') {
        continue
      }

      const columnMatch = trimmedLine.match(columnPattern)
      if (!columnMatch) {
        continue
      }

      const [, name, type, modifiers] = columnMatch
      if (!(name && type)) {
        continue
      }

      const isArray = modifiers?.includes('.array()')
      const hasDefault = modifiers?.includes('.default(')
      const isOptional = !modifiers?.includes('.notNull()') || (isArray && hasDefault)

      let columnType: ColumnInfo['type'] = 'text'
      if (isArray) {
        columnType = 'array'
      } else if (type === 'integer') {
        columnType = 'integer'
      } else if (type === 'boolean') {
        columnType = 'boolean'
      } else if (type === 'timestamp') {
        columnType = 'timestamp'
      } else if (type === 'doublePrecision') {
        columnType = 'doublePrecision'
      } else if (type.endsWith('Status') || type.endsWith('Type') || type.endsWith('Role')) {
        columnType = 'enum'
      }

      columns.push({
        name,
        type: columnType,
        isOptional,
        isArray,
      })
    }

    return { name: tableName, columns }
  })

const toKebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

const generateSchemaFile = (tableInfo: TableInfo) => {
  const { name, columns } = tableInfo

  const hasArrayColumns = columns.some(col => col.isArray)

  if (!hasArrayColumns) {
    return `import { createInsertSchema, createSelectSchema } from '@handfish/drizzle-effect'

import { ${name} } from '../drizzle/schema'

export const insert${name}Schema = createInsertSchema(${name})
export const select${name}Schema = createSelectSchema(${name})
`
  }

  const arrayColumns = columns.filter(col => col.isArray)
  const arrayOverrides = arrayColumns
    .map(col => {
      const schemaType = col.isOptional
        ? 'Schema.optional(Schema.Array(Schema.String))'
        : 'Schema.Array(Schema.String)'
      return `\t${col.name}: ${schemaType},`
    })
    .join('\n')

  return `import { createInsertSchema, createSelectSchema } from '@handfish/drizzle-effect'
import { Schema } from 'effect'

import { ${name} } from '../drizzle/schema'

const base${name}InsertSchema = createInsertSchema(${name})
const base${name}SelectSchema = createSelectSchema(${name})

export const insert${name}Schema = Schema.Struct({
\t...base${name}InsertSchema.fields,
${arrayOverrides}
})

export const select${name}Schema = Schema.Struct({
\t...base${name}SelectSchema.fields,
${arrayOverrides}
})
`
}

const generateFormSchemaFile = (tableInfo: TableInfo) => {
  const { name } = tableInfo
  const kebabName = toKebabCase(name)

  return `import { Schema } from 'effect'

import { insert${name}Schema, select${name}Schema } from './${kebabName}-schemas'

export const insert${name}FormSchema = Schema.typeSchema(insert${name}Schema)
export const select${name}FormSchema = Schema.typeSchema(select${name}Schema)
`
}

const generateTypesFile = (tableInfo: TableInfo) => {
  const { name } = tableInfo
  const kebabName = toKebabCase(name)

  return `import type { insert${name}Schema, select${name}Schema } from './${kebabName}-schemas'

export type Insert${name} = typeof insert${name}Schema.Type
export type Select${name} = typeof select${name}Schema.Type

export type Insert${name}Encoded = typeof insert${name}Schema.Encoded
export type Select${name}Encoded = typeof select${name}Schema.Encoded
`
}

const main = Effect.gen(function* () {
  yield* Console.log('🔄 Generating individual Effect schema files...')

  const config = yield* makeConfig

  const schemaContent = yield* readSchemaFile(config.schemaPath)

  const tableNames = yield* extractTableNames(schemaContent)

  if (tableNames.length === 0) {
    yield* Effect.fail(new Error('No tables found in schema file'))
  }

  yield* Console.log(`📊 Found ${tableNames.length} tables: ${tableNames.join(', ')}`)

  for (const tableName of tableNames) {
    const tableInfo = yield* extractTableInfo(schemaContent, tableName)
    const kebabName = toKebabCase(tableName)

    const schemaFileContent = generateSchemaFile(tableInfo)
    const schemaPath = `${config.outputDir}/${kebabName}-schemas.ts`
    yield* writeSchemaFile(schemaPath, schemaFileContent)

    const typesFileContent = generateTypesFile(tableInfo)
    const typesPath = `${config.outputDir}/${kebabName}-types.ts`
    yield* writeSchemaFile(typesPath, typesFileContent)

    const formSchemaFileContent = generateFormSchemaFile(tableInfo)
    const formSchemaPath = `${config.outputDir}/${kebabName}-form-schemas.ts`
    yield* writeSchemaFile(formSchemaPath, formSchemaFileContent)

    yield* Console.log(`✅ Generated files for ${tableName}: schemas, types, form-schemas`)
  }

  const filesPerTable = 3
  yield* Console.log(
    `📝 Generated ${tableNames.length * filesPerTable} files (schemas, types, form-schemas) for ${tableNames.length} tables`
  )
})

const program = pipe(
  main,
  Effect.catchAll(error =>
    Effect.sync(() => {
      console.error('Failed to generate schemas:', error)
      process.exit(1)
    })
  )
)

Effect.runSync(program)

export { main as generateEffectSchemas }

