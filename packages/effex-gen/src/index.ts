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
  Options.withDescription('Output directory for generated schemas')
)

const servicesDirOption = Options.text('services-dir').pipe(
  Options.optional,
  Options.withDescription('Output directory for generated services')
)

const allOption = Options.boolean('all').pipe(
  Options.withAlias('a'),
  Options.optional,
  Options.withDescription('Accept all defaults without prompts')
)

const prismaCommand = Command.make(
  'prisma',
  {
    schemaPath: schemaPathOption,
    outputDir: outputDirOption,
    all: allOption,
  },
  options => generateServices(options)
)

const mainCommand = Command.make(
  'effex-gen',
  {
    schemaPath: schemaPathOption,
    outputDir: outputDirOption,
    servicesDir: servicesDirOption,
    all: allOption,
  },
  options => generateDrizzle(options)
).pipe(Command.withSubcommands([prismaCommand]))

const cli = Command.run(mainCommand, {
  name: 'effex-gen',
  version: '0.2.0',
})

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)
