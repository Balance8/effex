import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Console, Effect } from 'effect'
import pc from 'picocolors'

import { replaceVariables } from './replace-variables.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const _TEMPLATE_EXTENSION_REGEX = /\.template$/

export const copyTemplates = (
  projectName: string,
  targetPath: string,
  packageManager: 'bun' | 'pnpm' | 'npm'
) =>
  Effect.gen(function* () {
    const templateDir = join(__dirname, '../templates')

    yield* Console.log(pc.gray('📋 Copying template files...'))

    yield* Effect.sync(() =>
      copyDirectorySync(templateDir, targetPath, {
        projectName,
        packageManager,
      })
    )
  })

type TemplateVariables = {
  projectName: string
  packageManager: 'bun' | 'pnpm' | 'npm'
}

function shouldSkipFile(entry: string, packageManager: 'bun' | 'pnpm' | 'npm'): boolean {
  if (entry === 'pnpm-workspace.yaml' && packageManager !== 'pnpm') {
    return true
  }
  return false
}

function copyDirectorySync(
  source: string,
  destination: string,
  variables: TemplateVariables
): void {
  mkdirSync(destination, { recursive: true })

  const entries = readdirSync(source)

  for (const entry of entries) {
    if (shouldSkipFile(entry, variables.packageManager)) {
      continue
    }

    const sourcePath = join(source, entry)
    let destPath = join(destination, entry)
    const stat = statSync(sourcePath)

    if (entry.endsWith('.template')) {
      destPath = destPath.replace(_TEMPLATE_EXTENSION_REGEX, '')
    }

    if (stat.isDirectory()) {
      copyDirectorySync(sourcePath, destPath, variables)
    } else {
      const content = readFileSync(sourcePath, 'utf-8')
      const processedContent = replaceVariables(content, variables)
      writeFileSync(destPath, processedContent, 'utf-8')
    }
  }

  if (variables.packageManager === 'bun') {
    writeFileSync(join(destination, 'bun.lockb'), '', 'utf-8')
  }
}
