import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { Console, Effect, Option, Schema } from 'effect'
import pc from 'picocolors'

import { generateDrizzleServices } from '../generators/drizzle-service-generator.js'
import { parseDrizzleSchema } from '../parsers/drizzle-parser.js'

const GenerateDrizzleOptionsSchema = Schema.Struct({
  schemaPath: Schema.OptionFromSelf(Schema.String),
  outputDir: Schema.OptionFromSelf(Schema.String),
  servicesDir: Schema.OptionFromSelf(Schema.String),
  all: Schema.OptionFromSelf(Schema.Boolean),
})

export type GenerateDrizzleOptions = typeof GenerateDrizzleOptionsSchema.Type

function findDrizzleSchema() {
  const possiblePaths = [
    './src/schema.ts',
    './packages/database/src/schema.ts',
    '../database/src/schema.ts',
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
    return resolve('./packages/database/src/generated/effect')
  }
  return resolve('./src/generated/effect')
}

function _getDefaultServicesDir(schemaPath: string) {
  if (schemaPath.includes('packages/database')) {
    return resolve('./packages/api/src/services')
  }
  return resolve('./src/services')
}

export const generateDrizzle = (options: GenerateDrizzleOptions) =>
  Effect.gen(function* () {
    const providedSchemaPath = Option.isSome(options.schemaPath)
      ? Option.getOrThrow(options.schemaPath)
      : null

    const schemaPath = providedSchemaPath || findDrizzleSchema()

    if (!schemaPath) {
      yield* Console.error(
        pc.red(
          '❌ Could not find Drizzle schema. Please specify --schema-path or ensure schema.ts exists in ./src/ or ./packages/database/src/'
        )
      )
      return yield* Effect.fail(new Error('Drizzle schema not found'))
    }

    if (!existsSync(schemaPath)) {
      yield* Console.error(pc.red(`❌ Drizzle schema not found at: ${schemaPath}`))
      return yield* Effect.fail(new Error(`Schema file does not exist: ${schemaPath}`))
    }

    const outputDir = Option.isSome(options.outputDir)
      ? resolve(Option.getOrThrow(options.outputDir))
      : getDefaultOutputDir(schemaPath)

    const _servicesDir = Option.isSome(options.servicesDir)
      ? resolve(Option.getOrThrow(options.servicesDir))
      : _getDefaultServicesDir(schemaPath)

    yield* Console.log(pc.cyan('🔄 Generating Effect schemas and services from Drizzle schema...'))
    yield* Console.log(pc.gray(`📄 Schema: ${schemaPath}`))

    try {
      const tables = yield* parseDrizzleSchema(schemaPath)

      if (tables.length === 0) {
        yield* Console.warn(pc.yellow('⚠️  No tables found in schema'))
        return
      }

      generateDrizzleServices(tables, outputDir, _servicesDir)
      yield* Console.log(pc.green('✅ Effect schemas and services generated successfully!'))
      yield* Console.log(pc.cyan(`📁 Schemas output: ${outputDir}/schemas`))
      yield* Console.log(pc.cyan(`📁 Services output: ${_servicesDir}`))

      yield* Console.log(
        pc.gray('\n💡 Tip: Import schemas from @workspace/database/effect/schemas/*')
      )
      yield* Console.log(pc.gray('💡 Tip: Import services from @workspace/api'))
    } catch (error) {
      yield* Console.error(pc.red('❌ Failed to generate from Drizzle schema'))
      throw error
    }
  })
