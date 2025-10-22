export type PackageManager = 'bun' | 'pnpm' | 'npm'

export const getPackageManagerExecutable = (packageManager: PackageManager): string => {
  switch (packageManager) {
    case 'npm':
      return 'npx'
    case 'bun':
      return 'bun'
    case 'pnpm':
      return 'pnpm'
    default:
      return 'npx'
  }
}
