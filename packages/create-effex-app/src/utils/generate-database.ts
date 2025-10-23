import { spawnSync } from 'node:child_process'
import { join, normalize } from 'node:path'
import { Effect } from 'effect'

import type { PackageManager } from './package-manager.js'

const UNC_PATH_REGEX = /^\\\\\?\\/

export const generateDatabase = (targetPath: string, packageManager: PackageManager) =>
  Effect.sync(() => {
    const normalizedPath = normalize(targetPath).replace(UNC_PATH_REGEX, '')
    const databasePath = join(normalizedPath, 'packages', 'database')

    const runCommand = packageManager === 'npm' ? 'npx' : packageManager

    const result = spawnSync(runCommand, ['run', 'db:generate'], {
      cwd: databasePath,
      stdio: 'inherit',
      shell: true,
    })

    if (result.error) {
      throw result.error
    }

    if (result.status !== 0) {
      throw new Error(`Database generation failed with exit code ${result.status}`)
    }
  })
