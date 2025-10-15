import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join, normalize } from 'node:path'
import { Effect } from 'effect'

const UNC_PATH_REGEX = /^\\\\\?\\/

export const initializeGit = (targetPath: string) =>
  Effect.sync(() => {
    const normalizedPath = normalize(targetPath).replace(UNC_PATH_REGEX, '')
    const gitignoreContent = `
node_modules
.next
.turbo
dist
build
.env
.env.local
.env.*.local
*.log
.DS_Store
coverage
.vscode
.idea
*.swp
*.swo
*~
.cache
.parcel-cache
.vercel
.netlify
.output
.nuxt
.nitro
.cache
.temp
.tmp
`.trim()

    writeFileSync(join(normalizedPath, '.gitignore'), gitignoreContent, 'utf-8')

    const gitInit = spawnSync('git', ['init'], {
      cwd: normalizedPath,
      stdio: 'pipe',
      shell: true,
    })

    if (gitInit.error) {
      throw gitInit.error
    }

    const gitAdd = spawnSync('git', ['add', '.'], {
      cwd: normalizedPath,
      stdio: 'pipe',
      shell: true,
    })

    if (gitAdd.error) {
      throw gitAdd.error
    }

    const gitCommit = spawnSync('git', ['commit', '-m', 'Initial commit from effex'], {
      cwd: normalizedPath,
      stdio: 'pipe',
      shell: true,
    })

    if (gitCommit.error) {
      throw gitCommit.error
    }
  })
