import { Prompt } from '@effect/cli'

export const promptProjectName = (defaultName: string) =>
  Prompt.run(
    Prompt.text({
      message: 'Project name',
      default: defaultName,
    })
  )

export const promptPackageManager = () =>
  Prompt.run(
    Prompt.select({
      message: 'Select package manager',
      choices: [
        { title: 'Bun (recommended)', value: 'bun' as const },
        { title: 'pnpm', value: 'pnpm' as const },
        { title: 'npm', value: 'npm' as const },
      ],
    })
  )

export const promptDatabase = () =>
  Prompt.run(
    Prompt.select({
      message: 'Select database provider',
      choices: [
        { title: 'PostgreSQL (recommended)', value: 'postgresql' as const },
        { title: 'MySQL', value: 'mysql' as const },
        { title: 'SQLite', value: 'sqlite' as const },
      ],
    })
  )

export const promptAuth = () =>
  Prompt.run(
    Prompt.confirm({
      message: 'Include authentication setup?',
      initial: false,
    })
  )

export const promptSkipInstall = () =>
  Prompt.run(
    Prompt.confirm({
      message: 'Skip installing dependencies?',
      initial: false,
    })
  )

export const promptSkipGit = () =>
  Prompt.run(
    Prompt.confirm({
      message: 'Skip git initialization?',
      initial: false,
    })
  )

export const promptSkipHusky = () =>
  Prompt.run(
    Prompt.confirm({
      message: 'Skip git hooks setup with Husky?',
      initial: false,
    })
  )
