import { resolve } from 'node:path'
import { Console, Effect, Schema } from 'effect'
import pc from 'picocolors'

import { generateEffectServices } from '../generators/effect-service-generator'
import { Spinner } from '../utils/spinner'

const GenerateServicesOptionsSchema = Schema.Struct({
  schemaPath: Schema.OptionFromSelf(Schema.String),
  outputDir: Schema.OptionFromSelf(Schema.String),
})

export type GenerateServicesOptions = Schema.Schema.Type<typeof GenerateServicesOptionsSchema>

export const generateServices = (options: GenerateServicesOptions) =>
  Effect.gen(function* () {
    const schemaPath = resolve(
      typeof options.schemaPath === 'string' ? options.schemaPath : './prisma/schema.prisma'
    )
    const outputDir = resolve(
      typeof options.outputDir === 'string' ? options.outputDir : './src/generated/effect'
    )

    const spinner = new Spinner('Generating Effect services from Prisma schema...')

    try {
      spinner.start()
      generateEffectServices(schemaPath, outputDir)
      spinner.succeed('✅ Effect services generated successfully!')
      yield* Console.log(pc.cyan(`📁 Output directory: ${outputDir}`))
    } catch (error) {
      spinner.fail('❌ Failed to generate Effect services')
      throw error
    }
  })
