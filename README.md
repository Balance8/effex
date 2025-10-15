# Effex

A CLI tool to scaffold modern full-stack applications with:

- **Turbo Repo** - High-performance monorepo build system
- **Next.js** - React framework for production
- **Prisma** - Next-generation ORM
- **Effect-TS** - Powerful functional programming library
- **Biome with Ultracite** - Lightning-fast formatter and linter

## Quick Start

### Using npm create (Recommended)

```bash
npm create effex-app
```

Or with a project name:

```bash
npm create effex-app my-app
```

### Using npx

```bash
npx effex create my-app
```

### With Options

```bash
npm create effex-app my-app --package-manager bun --database postgresql
npx effex create my-app --package-manager bun --database postgresql
```

## Commands

### Create a New Project

```bash
effex create <project-name> [options]
```

**Options:**

- `--package-manager <bun|pnpm|npm>` - Package manager to use (default: bun)
- `--database <postgresql|mysql|sqlite>` - Database provider (default: postgresql)
- `--skip-install` - Skip dependency installation
- `--skip-git` - Skip git initialization
- `--auth` - Include authentication setup (coming soon)
- `--directory <path>` - Custom directory for the project

**Examples:**

```bash
effex create my-app
effex create my-app --package-manager pnpm --database mysql
effex create my-app --skip-install --skip-git
```

### Generate Effect Services

Generate type-safe Effect-TS services from your Prisma schema:

```bash
effex gen [options]
effex generate [options]  # alias
```

**Options:**

- `--schema-path <path>` - Path to Prisma schema (auto-detected if not provided)
- `--output-dir <path>` - Output directory for generated services (default: ./src/generated/effect)

**Examples:**

```bash
effex gen
effex gen --schema-path ./custom/schema.prisma
effex gen --output-dir ./src/services
```

**Auto-detection:** The CLI automatically finds your Prisma schema in common locations:

- `./prisma/schema.prisma`
- `./packages/database/prisma/schema.prisma`
- `../prisma/schema.prisma`

## Features

### Type-Safe Effect Services

Effex automatically generates fully type-safe Effect-TS services from your Prisma schema:

- ✅ **Full type inference** - No `any` types, leverages TypeScript's inference
- ✅ **Effect Schema v0.75** - Runtime validation with proper type extraction
- ✅ **Prisma Client types** - All operations use Prisma's generated types
- ✅ **Error handling** - Tagged errors for database operations
- ✅ **Service pattern** - Context.Tag for dependency injection

### Generated Services Include

All standard Prisma operations wrapped in Effect:

- `findMany`, `findUnique`, `findFirst`
- `create`, `createMany`, `update`, `updateMany`
- `delete`, `deleteMany`
- `aggregate`, `groupBy`, `count`

### Project Structure

Generated projects include:

- `apps/web` - Next.js application
- `packages/database` - Prisma schema and Effect services
- `packages/ui` - Shared UI components
- `packages/typescript-config` - Shared TypeScript configs

## Development

After creating a project:

```bash
cd my-app
npm run dev
```

Generate Prisma client and Effect services:

```bash
npm run db:generate
```

This automatically runs both `prisma generate` and `effex gen`.

## Learn More

- [Effect Documentation](https://effect.website)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Turbo Documentation](https://turbo.build/repo/docs)
- [Biome Documentation](https://biomejs.dev)
