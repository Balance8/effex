const PACKAGE_MANAGER_VERSIONS = {
  bun: '1.3.0',
  pnpm: '10.18.3',
  npm: '11.6.2',
} as const

const PACKAGE_MANAGER_EXECUTABLES = {
  bun: 'bun x',
  pnpm: 'pnpx',
  npm: 'npx',
} as const

const _PACKAGE_MANAGER_INSTALL = {
  bun: 'bun install',
  pnpm: 'pnpm install',
  npm: 'npm install',
} as const

export const replaceVariables = (content: string, variables: Record<string, string | boolean>) => {
  let result = content

  for (const [key, value] of Object.entries(variables)) {
    if (key === 'packageManager' && typeof value === 'string') {
      const version = PACKAGE_MANAGER_VERSIONS[value as keyof typeof PACKAGE_MANAGER_VERSIONS]
      const executable =
        PACKAGE_MANAGER_EXECUTABLES[value as keyof typeof PACKAGE_MANAGER_EXECUTABLES]
      const install = _PACKAGE_MANAGER_INSTALL[value as keyof typeof _PACKAGE_MANAGER_INSTALL]
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, `${value}@${version}`)
      const executableRegex = /{{packageManagerExecutable}}/g
      result = result.replace(executableRegex, executable)
      const installRegex = /{{packageManagerInstall}}/g
      result = result.replace(installRegex, install)
    } else if (key === 'skipHusky') {
      const huskyPrepareScript = value === true ? '' : '"prepare": "husky"'
      result = result.replace(/"{{huskyPrepareScript}}"/g, huskyPrepareScript)

      if (value === true) {
        result = result.replace(/,\s*\n\s*$/gm, '')
        result = result.replace(/,?\s*"@commitlint\/cli":\s*"[^"]+"\s*,?/g, '')
        result = result.replace(/,?\s*"@commitlint\/config-conventional":\s*"[^"]+"\s*,?/g, '')
        result = result.replace(/,?\s*"husky":\s*"[^"]+"\s*,?/g, '')
        result = result.replace(/,(\s*})/g, '$1')
      }
    } else if (typeof value === 'string') {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, value)
    }
  }

  return result
}
