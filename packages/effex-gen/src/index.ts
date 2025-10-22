import { Command, Options } from '@effect/cli'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Effect } from 'effect'

import { generateDrizzle } from './commands/generate-drizzle.js'
import { generateServices } from './commands/generate-services.js'

const schemaPathOption = Options.text('schema-path').pipe(
  Options.optional,
  Options.withDescription('Path to schema file')
)

const outputDirOption = Options.text('output-dir').pipe(
  Options.optional,
  Options.withDescription('Output directory for generated services')
)

const apiDirOption = Options.text('api-dir').pipe(
  Options.optional,
  Options.withDescription('Output directory for generated API routers')
)

const drizzleCommand = Command.make(
  'drizzle',
  {
    schemaPath: schemaPathOption,
    outputDir: outputDirOption,
    apiDir: apiDirOption,
  },
  options => generateDrizzle(options)
)

const prismaCommand = Command.make(
  'prisma',
  {
    schemaPath: schemaPathOption,
    outputDir: outputDirOption,
  },
  options => generateServices(options)
)

const mainCommand = Command.make('effex-gen').pipe(
  Command.withSubcommands([drizzleCommand, prismaCommand])
)

const cli = Command.run(mainCommand, {
  name: 'effex-gen',
  version: '0.2.0',
})

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)
