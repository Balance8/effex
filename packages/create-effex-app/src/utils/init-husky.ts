import { spawnSync } from 'node:child_process'
import { normalize } from 'node:path'
import { Effect } from 'effect'

import { getPackageManagerExecutable, type PackageManager } from './package-manager.js'

const UNC_PATH_REGEX = /^\\\\\?\\/

export const initHusky = (targetPath: string, packageManager: PackageManager) =>
  Effect.sync(() => {
    const normalizedPath = normalize(targetPath).replace(UNC_PATH_REGEX, '')

    const command = getPackageManagerExecutable(packageManager)

    const result = spawnSync(command, ['husky', 'init'], {
      cwd: normalizedPath,
      stdio: 'inherit',
      shell: true,
    })

    if (result.error) {
      throw result.error
    }

    if (result.status !== 0) {
      throw new Error(`husky init failed with exit code ${result.status}`)
    }
  })
