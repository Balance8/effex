import { FileSystem } from '@effect/platform'
import { Console, Effect, Schema } from 'effect'
import pc from 'picocolors'

import { showBanner, showSuccess } from '../utils/banner.js'
import { copyTemplates } from '../utils/copy-templates.js'
import { initializeGit } from '../utils/git.js'
import { installDependencies } from '../utils/install-dependencies.js'
import { validateProjectName } from '../utils/validate.js'

const PackageManagerSchema = Schema.Literal('bun', 'pnpm', 'npm')
const DatabaseSchema = Schema.Literal('postgresql', 'mysql', 'sqlite')

const CreateProjectOptionsSchema = Schema.Struct({
  projectName: Schema.String,
  packageManager: PackageManagerSchema,
  database: DatabaseSchema,
  skipInstall: Schema.Boolean,
  skipGit: Schema.Boolean,
  auth: Schema.Boolean,
  verbose: Schema.Boolean,
  directory: Schema.OptionFromSelf(Schema.String),
})

export type CreateProjectOptions = Schema.Schema.Type<typeof CreateProjectOptionsSchema>

export const createProject = (options: CreateProjectOptions) =>
  Effect.gen(function* () {
    const { projectName, packageManager, database, skipInstall, skipGit, auth, verbose } = options
    const fs = yield* FileSystem.FileSystem

    showBanner()

    yield* Console.log(pc.cyan('✨ Creating your effex project...\n'))

    if (verbose) {
      yield* Console.log(pc.gray('Configuration:'))
      yield* Console.log(pc.gray(`  Project name: ${projectName}`))
      yield* Console.log(pc.gray(`  Package manager: ${packageManager}`))
      yield* Console.log(pc.gray(`  Database: ${database}`))
      yield* Console.log(pc.gray(`  Authentication: ${auth ? 'Yes' : 'No'}`))
      yield* Console.log(pc.gray(`  Skip install: ${skipInstall ? 'Yes' : 'No'}`))
      yield* Console.log(pc.gray(`  Skip git: ${skipGit ? 'Yes' : 'No'}\n`))
    }

    yield* validateProjectName(projectName)

    const targetPath = yield* fs.makeDirectory(projectName, { recursive: true })

    yield* Console.log(pc.gray(`📁 Creating project at: ${targetPath}`))

    yield* copyTemplates(projectName, targetPath, packageManager)

    yield* Console.log(pc.green('\n✅ Project structure created!'))

    if (!skipGit) {
      yield* Console.log(pc.gray('\n📝 Initializing git repository...'))
      yield* initializeGit(targetPath)
      yield* Console.log(pc.green('✅ Git repository initialized!'))
    }

    if (!skipInstall) {
      yield* Console.log(pc.cyan('\n📦 Installing dependencies...\n'))
      yield* installDependencies(targetPath, packageManager)
      yield* Console.log(pc.green('\n✅ Dependencies installed!'))
    }

    showSuccess(projectName, packageManager, skipInstall)
  })
