import { Args, Command, Options } from '@effect/cli'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Effect } from 'effect'

import { createProject } from './commands/create.js'

const projectName = Args.text({ name: 'project-name' }).pipe(Args.optional)

const packageManagerOption = Options.choice('package-manager', ['bun', 'pnpm', 'npm']).pipe(
  Options.optional,
  Options.withDescription('Package manager to use')
)

const databaseOption = Options.choice('database', ['postgresql', 'mysql', 'sqlite']).pipe(
  Options.optional,
  Options.withDescription('Database provider to use')
)

const verboseOption = Options.boolean('verbose').pipe(
  Options.withDefault(false),
  Options.withDescription('Enable verbose output')
)

const directoryOption = Options.text('directory').pipe(
  Options.optional,
  Options.withDescription('Custom directory to create the project in')
)

const allOption = Options.boolean('all').pipe(
  Options.withAlias('a'),
  Options.withDefault(false),
  Options.withDescription('Accept all defaults without prompts')
)

const createCommand = Command.make(
  'create-effex-app',
  {
    projectName,
    packageManager: packageManagerOption,
    database: databaseOption,
    verbose: verboseOption,
    directory: directoryOption,
    all: allOption,
  },
  options => createProject(options)
)

const cli = Command.run(createCommand, {
  name: 'create-effex-app',
  version: '0.0.1',
})

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)
