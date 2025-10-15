import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { Console, Effect, Option, Schema } from 'effect'
import pc from 'picocolors'

import { generateEffectServices } from '../generators/effect-service-generator.js'

const GenerateServicesOptionsSchema = Schema.Struct({
  schemaPath: Schema.OptionFromSelf(Schema.String),
  outputDir: Schema.OptionFromSelf(Schema.String),
})

export type GenerateServicesOptions = typeof GenerateServicesOptionsSchema.Type

function findPrismaSchema() {
  const possiblePaths = [
    './prisma/schema.prisma',
    './packages/database/prisma/schema.prisma',
    '../prisma/schema.prisma',
  ]

  for (const path of possiblePaths) {
    const resolvedPath = resolve(path)
    if (existsSync(resolvedPath)) {
      return resolvedPath
    }
  }

  return null
}

function getDefaultOutputDir(schemaPath: string) {
  if (schemaPath.includes('packages/database')) {
    return resolve('./src/generated/effect')
  }
  return resolve('./src/generated/effect')
}

export const generateServices = (options: GenerateServicesOptions) =>
  Effect.gen(function* () {
    const providedSchemaPath = Option.isSome(options.schemaPath)
      ? Option.getOrThrow(options.schemaPath)
      : null

    const schemaPath = providedSchemaPath || findPrismaSchema()

    if (!schemaPath) {
      yield* Console.error(
        pc.red(
          '❌ Could not find Prisma schema. Please specify --schema-path or ensure schema.prisma exists in ./prisma/ or ./packages/database/prisma/'
        )
      )
      return yield* Effect.fail(new Error('Prisma schema not found'))
    }

    if (!existsSync(schemaPath)) {
      yield* Console.error(pc.red(`❌ Prisma schema not found at: ${schemaPath}`))
      return yield* Effect.fail(new Error(`Schema file does not exist: ${schemaPath}`))
    }

    const outputDir = Option.isSome(options.outputDir)
      ? resolve(Option.getOrThrow(options.outputDir))
      : getDefaultOutputDir(schemaPath)

    yield* Console.log(pc.cyan('🔄 Generating Effect services from Prisma schema...'))
    yield* Console.log(pc.gray(`📄 Schema: ${schemaPath}`))

    try {
      generateEffectServices(schemaPath, outputDir)
      yield* Console.log(pc.green('✅ Effect services generated successfully!'))
      yield* Console.log(pc.cyan(`📁 Output: ${outputDir}`))
      yield* Console.log(
        pc.gray('\n💡 Tip: Import services from @workspace/database/effect/services/*')
      )
    } catch (error) {
      yield* Console.error(pc.red('❌ Failed to generate Effect services'))
      throw error
    }
  })
