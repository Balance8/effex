import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Console, Effect } from 'effect'
import pc from 'picocolors'

import type { PackageManager } from './package-manager.js'
import { replaceVariables } from './replace-variables.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const _TEMPLATE_EXTENSION_REGEX = /\.template$/

function getTemplateDir(): string {
  const currentDir = __dirname
  const distDir = currentDir.includes('dist')
    ? `${currentDir.split('dist')[0]}dist`
    : dirname(dirname(__dirname))
  return join(distDir, 'templates')
}

export const copyTemplates = (
  projectName: string,
  targetPath: string,
  packageManager: PackageManager,
  skipHusky: boolean
) =>
  Effect.gen(function* () {
    const templateDir = getTemplateDir()

    yield* Console.log(pc.gray('📋 Copying template files...'))

    yield* Effect.sync(() =>
      copyDirectorySync(templateDir, targetPath, {
        projectName,
        packageManager,
        skipHusky,
      })
    )
  })

type TemplateVariables = {
  projectName: string
  packageManager: PackageManager
  skipHusky: boolean
}

function shouldSkipFile(entry: string, variables: TemplateVariables): boolean {
  if (entry === 'pnpm-workspace.yaml' && variables.packageManager !== 'pnpm') {
    return true
  }
  if (variables.skipHusky && (entry === '.husky' || entry === 'commitlint.config.js')) {
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
    if (shouldSkipFile(entry, variables)) {
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
}
