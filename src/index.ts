import { Args, Command, Options } from '@effect/cli'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Effect } from 'effect'

import { createProject } from './commands/create.js'
import { generateServices } from './commands/generate-services.js'

const projectName = Args.text({ name: 'project-name' })

const packageManagerOption = Options.choice('package-manager', ['bun', 'pnpm', 'npm']).pipe(
  Options.withDefault('bun' as const),
  Options.withDescription('Package manager to use')
)

const databaseOption = Options.choice('database', ['postgresql', 'mysql', 'sqlite']).pipe(
  Options.withDefault('postgresql' as const),
  Options.withDescription('Database provider to use')
)

const skipInstallOption = Options.boolean('skip-install').pipe(
  Options.withDefault(false),
  Options.withDescription('Skip installing dependencies')
)

const skipGitOption = Options.boolean('skip-git').pipe(
  Options.withDefault(false),
  Options.withDescription('Skip git initialization')
)

const authOption = Options.boolean('auth').pipe(
  Options.withDefault(false),
  Options.withDescription('Include authentication setup')
)

const verboseOption = Options.boolean('verbose').pipe(
  Options.withDefault(false),
  Options.withDescription('Enable verbose output')
)

const directoryOption = Options.text('directory').pipe(
  Options.optional,
  Options.withDescription('Custom directory to create the project in')
)

const createCommand = Command.make(
  'create',
  {
    projectName,
    packageManager: packageManagerOption,
    database: databaseOption,
    skipInstall: skipInstallOption,
    skipGit: skipGitOption,
    auth: authOption,
    verbose: verboseOption,
    directory: directoryOption,
  },
  options => createProject(options)
)

const schemaPathOption = Options.text('schema-path').pipe(
  Options.optional,
  Options.withDescription('Path to Prisma schema file')
)

const outputDirOption = Options.text('output-dir').pipe(
  Options.optional,
  Options.withDescription('Output directory for generated services')
)

const generateCommand = Command.make(
  'generate',
  {
    schemaPath: schemaPathOption,
    outputDir: outputDirOption,
  },
  ({ schemaPath, outputDir }) =>
    generateServices({
      schemaPath,
      outputDir,
    })
)

const mainCommand = Command.make('effex', {}, () => Effect.void).pipe(
  Command.withSubcommands([createCommand, generateCommand])
)

const cli = Command.run(mainCommand, {
  name: 'effex',
  version: '0.0.1',
})

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)
