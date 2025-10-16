const PACKAGE_MANAGER_VERSIONS = {
  bun: '1.3.0',
  pnpm: '9.15.4',
  npm: '11.0.0',
} as const

export const replaceVariables = (content: string, variables: Record<string, string>): string => {
  let result = content

  for (const [key, value] of Object.entries(variables)) {
    if (key === 'packageManager') {
      const version = PACKAGE_MANAGER_VERSIONS[value as keyof typeof PACKAGE_MANAGER_VERSIONS]
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, `${value}@${version}`)
    } else {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, value)
    }
  }

  return result
}
