import { FileSystem } from '@effect/platform'
import { Console, Effect, Option, Schema } from 'effect'
import pc from 'picocolors'

import { showBanner, showSuccess } from '../utils/banner.js'
import { copyTemplates } from '../utils/copy-templates.js'
import { initializeGit } from '../utils/git.js'
import { initHusky } from '../utils/init-husky.js'
import { installDependencies } from '../utils/install-dependencies.js'
import { promptDatabase, promptPackageManager, promptProjectName } from '../utils/prompts.js'
import { validateProjectName } from '../utils/validate.js'

const PackageManagerSchema = Schema.Literal('bun', 'pnpm', 'npm')
const DatabaseSchema = Schema.Literal('postgresql', 'mysql', 'sqlite')

const CreateProjectOptionsSchema = Schema.Struct({
  projectName: Schema.OptionFromSelf(Schema.String),
  packageManager: PackageManagerSchema,
  database: DatabaseSchema,
  skipInstall: Schema.Boolean,
  skipGit: Schema.Boolean,
  skipHusky: Schema.Boolean,
  auth: Schema.Boolean,
  verbose: Schema.Boolean,
  directory: Schema.OptionFromSelf(Schema.String),
})

export type CreateProjectOptions = typeof CreateProjectOptionsSchema.Type

export const createProject = (options: CreateProjectOptions) =>
  Effect.gen(function* () {
    const {
      packageManager: defaultPackageManager,
      database: defaultDatabase,
      skipInstall,
      skipGit,
      skipHusky,
      auth,
      verbose,
    } = options
    const fs = yield* FileSystem.FileSystem

    showBanner()

    const projectName = Option.isSome(options.projectName)
      ? Option.getOrThrow(options.projectName)
      : yield* promptProjectName('my-effex-app')

    const packageManager = yield* promptPackageManager(defaultPackageManager)
    const database = yield* promptDatabase(defaultDatabase)

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

    yield* copyTemplates(projectName, projectName, packageManager)

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
