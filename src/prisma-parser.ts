import { FileSystem } from '@effect/platform/FileSystem'
import * as S from '@effect/schema/Schema'
import { getSchema, printSchema } from '@mrleebo/prisma-ast'
import { Effect } from 'effect'

export class ParseError {
  readonly _tag = 'ParseError' as const
  readonly message: string
  readonly position?: { readonly line: number; readonly column: number }

  constructor(message: string, position?: { readonly line: number; readonly column: number }) {
    this.message = message
    this.position = position
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

const PrismaSchemaSchema = S.Unknown

export const parseSchema = (source: string) =>
  Effect.try({
    try: () => getSchema(source),
    catch: (error: unknown) =>
      new ParseError(error instanceof Error ? error.message : 'Unknown parse error'),
  }).pipe(
    Effect.flatMap(rawAst =>
      S.decodeUnknown(PrismaSchemaSchema)(rawAst).pipe(
        Effect.mapError(error => new ParseError(`Schema validation failed: ${error.message}`))
      )
    )
  )

export const parseFromFile = (path: string) =>
  Effect.gen(function* (_) {
    const fs = yield* _(FileSystem)
    const source = yield* _(
      fs.readFileString(path),
      Effect.mapError(
        error =>
          new FileReadError(
            error instanceof Error ? error.message : 'Unknown file read error',
            path
          )
      )
    )
    return yield* _(parseSchema(source))
  })

export const formatSchema = (ast: unknown) =>
  Effect.try({
    try: () => printSchema(ast as Parameters<typeof printSchema>[0]),
    catch: (error: unknown) =>
      new ParseError(error instanceof Error ? error.message : 'Unknown format error'),
  })

export type PrismaAST = unknown
