import { FileSystem } from '@effect/platform'
import { Console, Effect, Option, Schema } from 'effect'
import pc from 'picocolors'

import { showBanner, showSuccess } from '../utils/banner.js'
import { copyTemplates } from '../utils/copy-templates.js'
import { initializeGit } from '../utils/git.js'
import { initHusky } from '../utils/init-husky.js'
import { installDependencies } from '../utils/install-dependencies.js'
import {
  promptAuth,
  promptDatabase,
  promptPackageManager,
  promptProjectName,
  promptSkipGit,
  promptSkipHusky,
  promptSkipInstall,
} from '../utils/prompts.js'
import { validateProjectName } from '../utils/validate.js'

const PackageManagerSchema = Schema.Literal('bun', 'pnpm', 'npm')
const DatabaseSchema = Schema.Literal('postgresql', 'mysql', 'sqlite')

const CreateProjectOptionsSchema = Schema.Struct({
  projectName: Schema.OptionFromSelf(Schema.String),
  packageManager: Schema.OptionFromSelf(PackageManagerSchema),
  database: Schema.OptionFromSelf(DatabaseSchema),
  verbose: Schema.Boolean,
  directory: Schema.OptionFromSelf(Schema.String),
  all: Schema.Boolean,
})

export type CreateProjectOptions = typeof CreateProjectOptionsSchema.Type

export const createProject = (options: CreateProjectOptions) =>
  Effect.gen(function* () {
    const { verbose, all } = options
    const fs = yield* FileSystem.FileSystem

    showBanner()

    let projectName: string
    if (Option.isSome(options.projectName)) {
      projectName = Option.getOrThrow(options.projectName)
    } else if (all) {
      projectName = 'my-effex-app'
    } else {
      projectName = yield* promptProjectName('my-effex-app')
    }

    let packageManager: 'bun' | 'pnpm' | 'npm'
    if (Option.isSome(options.packageManager)) {
      packageManager = Option.getOrThrow(options.packageManager)
    } else if (all) {
      packageManager = 'bun'
    } else {
      packageManager = yield* promptPackageManager()
    }

    let database: 'postgresql' | 'mysql' | 'sqlite'
    if (Option.isSome(options.database)) {
      database = Option.getOrThrow(options.database)
    } else if (all) {
      database = 'postgresql'
    } else {
      database = yield* promptDatabase()
    }

    const auth = all ? false : yield* promptAuth()

    const skipInstall = all ? false : yield* promptSkipInstall()

    const skipGit = all ? false : yield* promptSkipGit()

    const skipHusky = all ? false : skipGit || (yield* promptSkipHusky())

    yield* Console.log(pc.cyan('\n✨ Creating your effex project...\n'))

    if (verbose) {
      yield* Console.log(pc.gray('Configuration:'))
      yield* Console.log(pc.gray(`  Project name: ${projectName}`))
      yield* Console.log(pc.gray(`  Package manager: ${packageManager}`))
      yield* Console.log(pc.gray(`  Database: ${database}`))
      yield* Console.log(pc.gray(`  Authentication: ${auth ? 'Yes' : 'No'}`))
      yield* Console.log(pc.gray(`  Skip install: ${skipInstall ? 'Yes' : 'No'}`))
      yield* Console.log(pc.gray(`  Skip git: ${skipGit ? 'Yes' : 'No'}`))
      yield* Console.log(pc.gray(`  Skip husky: ${skipHusky ? 'Yes' : 'No'}\n`))
    }

    yield* validateProjectName(projectName)

    yield* fs.makeDirectory(projectName, { recursive: true })

    yield* Console.log(pc.gray(`📁 Creating project at: ${projectName}`))

    yield* copyTemplates(projectName, projectName, packageManager, skipHusky)

    yield* Console.log(pc.green('\n✅ Project structure created!'))

    if (!skipGit) {
      yield* Console.log(pc.gray('\n📝 Initializing git repository...'))
      yield* initializeGit(projectName)
      yield* Console.log(pc.green('✅ Git repository initialized!'))
    }

    if (!skipInstall) {
      yield* Console.log(pc.cyan('\n📦 Installing dependencies...\n'))
      yield* installDependencies(projectName, packageManager)
      yield* Console.log(pc.green('\n✅ Dependencies installed!'))

      if (!(skipGit || skipHusky)) {
        yield* Console.log(pc.gray('\n🪝 Setting up git hooks...'))
        yield* initHusky(projectName, packageManager)
        yield* Console.log(pc.green('✅ Git hooks configured!'))
      }
    }

    showSuccess(projectName, packageManager, skipInstall)
  })
