import { createInterface } from 'node:readline'
import { Console, Effect } from 'effect'
import pc from 'picocolors'

type PackageManager = 'bun' | 'pnpm' | 'npm'
type Database = 'postgresql' | 'mysql' | 'sqlite'

const createReadlineInterface = () =>
  createInterface({
    input: process.stdin,
    output: process.stdout,
  })

const question = (prompt: string) =>
  Effect.promise(
    () =>
      new Promise<string>(resolve => {
        const rl = createReadlineInterface()
        rl.question(prompt, answer => {
          rl.close()
          resolve(answer.trim())
        })
      })
  )

export const promptProjectName = (defaultName: string) =>
  Effect.gen(function* () {
    const input = yield* question(pc.cyan('? Project name: ') + pc.gray(`(${defaultName}) `))
    return input || defaultName
  })

export const promptPackageManager = (defaultManager: PackageManager) =>
  Effect.gen(function* () {
    const options: PackageManager[] = ['bun', 'pnpm', 'npm']
    yield* Console.log(pc.cyan('? Package manager:'))
    for (const option of options) {
      const isDefault = option === defaultManager
      const marker = isDefault ? pc.green('❯') : ' '
      const label = isDefault ? pc.gray(' (default)') : ''
      yield* Console.log(`${marker} ${option}${label}`)
    }
    const input = yield* question(pc.cyan('Enter choice: '))
    const selected = input.toLowerCase() as PackageManager
    return (options.includes(selected) ? selected : defaultManager) as PackageManager
  })

export const promptDatabase = (defaultDb: Database) =>
  Effect.gen(function* () {
    const options: Database[] = ['postgresql', 'mysql', 'sqlite']
    yield* Console.log(pc.cyan('? Database provider:'))
    for (const option of options) {
      const isDefault = option === defaultDb
      const marker = isDefault ? pc.green('❯') : ' '
      const label = isDefault ? pc.gray(' (default)') : ''
      yield* Console.log(`${marker} ${option}${label}`)
    }
    const input = yield* question(pc.cyan('Enter choice: '))
    const selected = input.toLowerCase() as Database
    return (options.includes(selected) ? selected : defaultDb) as Database
  })
