export type PackageManager = 'bun' | 'pnpm' | 'npm'

export const getPackageManagerExecutable = (packageManager: PackageManager): string => {
  switch (packageManager) {
    case 'npm':
      return 'npx'
    case 'bun':
      return 'bunx'
    case 'pnpm':
      return 'pnpx'
    default:
      return 'npx'
  }
}
