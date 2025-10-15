import { spawnSync } from 'node:child_process'
import { normalize } from 'node:path'
import { Effect } from 'effect'

const UNC_PATH_REGEX = /^\\\\\?\\/

export const installDependencies = (targetPath: string, packageManager: 'bun' | 'pnpm' | 'npm') =>
  Effect.sync(() => {
    const normalizedPath = normalize(targetPath).replace(UNC_PATH_REGEX, '')

    const result = spawnSync(packageManager, ['install'], {
      cwd: normalizedPath,
      stdio: 'inherit',
      shell: true,
    })

    if (result.error) {
      throw result.error
    }

    if (result.status !== 0) {
      throw new Error(`${packageManager} install failed with exit code ${result.status}`)
    }
  })
