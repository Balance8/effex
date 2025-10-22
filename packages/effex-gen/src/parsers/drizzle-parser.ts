import { readFileSync } from 'node:fs'
import { Effect } from 'effect'

export class ParseError {
  readonly _tag = 'ParseError' as const
  readonly message: string

  constructor(message: string) {
    this.message = message
  }
}

export class FileReadError {
  readonly _tag = 'FileReadError' as const
  readonly message: string
  readonly path: string

  constructor(message: string, path: string) {
    this.message = message
    this.path = path
  }
}

export type DrizzleTable = {
  name: string
  columns: DrizzleColumn[]
}

export type DrizzleColumn = {
  name: string
  type: string
  isPrimaryKey: boolean
  isNotNull: boolean
  hasDefault: boolean
  isUnique: boolean
}

const TABLE_REGEX =
  /export\s+const\s+(\w+)\s+=\s+pgTable\s*\(\s*["'](\w+)["']\s*,\s*\(t\)\s*=>\s*\(\{([^}]+)\}\)\)/gs

const COLUMN_REGEX = /(\w+):\s*t\.(\w+)\([^)]*\)(.*)/

export const parseDrizzleSchema = (schemaPath: string) =>
  Effect.gen(function* () {
    try {
      const content = readFileSync(schemaPath, 'utf-8')

      const tables: DrizzleTable[] = []
      const tableRegex = new RegExp(TABLE_REGEX.source, TABLE_REGEX.flags)

      let match: RegExpExecArray | null = tableRegex.exec(content)
      while (match !== null) {
        const [, exportName, tableName, columnsStr] = match
        const columns = parseColumns(columnsStr || '')

        tables.push({
          name: exportName || tableName || '',
          columns,
        })

        match = tableRegex.exec(content)
      }

      return tables
    } catch (error) {
      return yield* Effect.fail(
        new FileReadError(error instanceof Error ? error.message : 'Unknown error', schemaPath)
      )
    }
  })

function parseColumns(columnsStr: string): DrizzleColumn[] {
  const columns: DrizzleColumn[] = []

  const columnLines = columnsStr.split('\n').filter(line => line.trim())

  for (const line of columnLines) {
    const columnMatch = line.match(COLUMN_REGEX)
    if (!columnMatch) {
      continue
    }

    const [, name, type, modifiers] = columnMatch

    columns.push({
      name: name || '',
      type: type || '',
      isPrimaryKey: modifiers?.includes('.primaryKey()') ?? false,
      isNotNull: modifiers?.includes('.notNull()') ?? false,
      hasDefault: (modifiers?.includes('.default') || modifiers?.includes('.$defaultFn')) ?? false,
      isUnique: modifiers?.includes('.unique()') ?? false,
    })
  }

  return columns
}
