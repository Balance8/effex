import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { generateEffectServices } from '../generators/effect-service-generator'

describe('Effect Service Generator', () => {
  const testDir = join(process.cwd(), '.test-generator')
  const schemaPath = join(testDir, 'schema.prisma')
  const outputDir = join(testDir, 'generated')

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true })

    const testSchema = `
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
  userId Int
  user  User @relation(fields: [userId], references: [id])
}
`
    writeFileSync(schemaPath, testSchema)
  })

  afterAll(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  it('should generate schema files for each model', () => {
    generateEffectServices(schemaPath, outputDir)

    const userSchemaPath = join(outputDir, 'schemas', 'user-schemas.ts')
    const postSchemaPath = join(outputDir, 'schemas', 'post-schemas.ts')

    expect(readFileSync(userSchemaPath, 'utf-8')).toContain('selectUserSchema')
    expect(readFileSync(userSchemaPath, 'utf-8')).toContain('insertUserSchema')
    expect(readFileSync(postSchemaPath, 'utf-8')).toContain('selectPostSchema')
    expect(readFileSync(postSchemaPath, 'utf-8')).toContain('insertPostSchema')
  })

  it('should generate service files for each model', () => {
    generateEffectServices(schemaPath, outputDir)

    const userServicePath = join(outputDir, 'services', 'UserService.ts')
    const postServicePath = join(outputDir, 'services', 'PostService.ts')

    const userService = readFileSync(userServicePath, 'utf-8')
    const postService = readFileSync(postServicePath, 'utf-8')

    expect(userService).toContain('UserService')

    expect(userService).toContain('findMany')
    expect(userService).toContain('findUnique')
    expect(userService).toContain('findUniqueOrThrow')
    expect(userService).toContain('findFirst')
    expect(userService).toContain('findFirstOrThrow')

    expect(userService).toContain('create')
    expect(userService).toContain('createMany')
    expect(userService).toContain('createManyAndReturn')

    expect(userService).toContain('update')
    expect(userService).toContain('updateMany')
    expect(userService).toContain('updateManyAndReturn')
    expect(userService).toContain('upsert')

    expect(userService).toContain('delete')
    expect(userService).toContain('deleteMany')

    expect(userService).toContain('aggregate')
    expect(userService).toContain('groupBy')
    expect(userService).toContain('count')
    expect(userService).toContain('findManyDistinct')

    expect(postService).toContain('PostService')
    expect(postService).toContain('findMany')
    expect(postService).toContain('findUnique')
  })

  it('should use Effect Schema for validation', () => {
    generateEffectServices(schemaPath, outputDir)

    const userSchemaPath = join(outputDir, 'schemas', 'user-schemas.ts')
    const content = readFileSync(userSchemaPath, 'utf-8')

    expect(content).toContain('Schema.Struct')
    expect(content).toContain('Schema.String')
    expect(content).toContain('Schema.Number')
  })
})
