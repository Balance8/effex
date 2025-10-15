import { Command, Options } from '@effect/cli'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Effect } from 'effect'

import { generateServices } from './commands/generate-services.js'

const schemaPathOption = Options.text('schema-path').pipe(
  Options.optional,
  Options.withDescription('Path to Prisma schema file')
)

const outputDirOption = Options.text('output-dir').pipe(
  Options.optional,
  Options.withDescription('Output directory for generated files')
)

const genCommand = Command.make(
  'gen',
  {
    schemaPath: schemaPathOption,
    outputDir: outputDirOption,
  },
  options => generateServices(options)
)

const generateCommand = Command.make(
  'generate',
  {
    schemaPath: schemaPathOption,
    outputDir: outputDirOption,
  },
  options => generateServices(options)
)

const mainCommand = Command.make('effex').pipe(
  Command.withSubcommands([genCommand, generateCommand])
)

const cli = Command.run(mainCommand, {
  name: 'effex',
  version: '0.1.0',
})

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)
