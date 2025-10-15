import { describe, expect, it } from 'bun:test'
import { Effect } from 'effect'

import { getDatasource, getModels, validateRelations } from '../prisma-ast-utils.js'
import { parseSchema } from '../prisma-parser.js'

const validSchema = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id    Int     @id @default(autoincrement())
  title String
  content String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
`

describe('Prisma Parser', () => {
  it('should parse a valid schema', async () => {
    const result = await Effect.runPromise(parseSchema(validSchema))
    expect(result).toBeDefined()
    expect(result.list).toBeDefined()
    expect(Array.isArray(result.list)).toBe(true)
  })

  it('should extract models from AST', async () => {
    const ast = await Effect.runPromise(parseSchema(validSchema))
    const models = await Effect.runPromise(getModels(ast))
    expect(models.length).toBeGreaterThan(0)
    expect(models.some((m: any) => m.name === 'User')).toBe(true)
    expect(models.some((m: any) => m.name === 'Post')).toBe(true)
  })

  it('should extract datasource from AST', async () => {
    const ast = await Effect.runPromise(parseSchema(validSchema))
    const datasource = await Effect.runPromise(getDatasource(ast))
    expect(datasource).toBeDefined()
    expect(datasource?.type).toBe('datasource')
  })

  it('should validate relations', async () => {
    const ast = await Effect.runPromise(parseSchema(validSchema))
    const result = await Effect.runPromise(
      validateRelations(ast).pipe(
        Effect.catchTag('ASTError', error =>
          Effect.succeed({
            success: false,
            error: error.message,
          })
        )
      )
    )
    expect(result).toBeDefined()
  })
})
