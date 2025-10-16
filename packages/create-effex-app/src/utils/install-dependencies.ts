import { spawnSync } from 'node:child_process'
import { normalize } from 'node:path'
import { Effect } from 'effect'

import type { PackageManager } from './package-manager.js'

const UNC_PATH_REGEX = /^\\\\\?\\/

export const installDependencies = (targetPath: string, packageManager: PackageManager) =>
  Effect.sync(() => {
    const normalizedPath = normalize(targetPath).replace(UNC_PATH_REGEX, '')

    const installArgs = packageManager === 'bun' ? ['install', '--force'] : ['install']

    const result = spawnSync(packageManager, installArgs, {
      cwd: normalizedPath,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        PRISMA_SKIP_POSTINSTALL_GENERATE: '1',
      },
    })

    if (result.error) {
      throw result.error
    }

    if (result.status !== 0) {
      throw new Error(`${packageManager} install failed with exit code ${result.status}`)
    }
  })
