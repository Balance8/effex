# create-effex-app

The easiest way to create a new Effex app.

## Usage

```bash
npm create-effex-app
```

Or with a project name:

```bash
npm create-effex-app my-app
```

With options:

```bash
npm create-effex-app my-app --package-manager bun --database postgresql
```

Accept all defaults without prompts:

```bash
npm create-effex-app my-app -a
npm create-effex-app my-app --all
```

## What You Get

A modern full-stack monorepo with:

- **Turbo Repo** - High-performance monorepo build system
- **Next.js** - React framework for production
- **Prisma** - Next-generation ORM with auto-generated Effect services
- **Effect-TS** - Powerful functional programming library
- **Biome with Ultracite** - Lightning-fast formatter and linter

## Options

- `-a, --all` - Accept all defaults without prompts (uses bun, postgresql, no auth)
- `--package-manager <bun|pnpm|npm>` - Package manager to use (default: bun)
- `--database <postgresql|mysql|sqlite>` - Database provider (default: postgresql)
- `--skip-install` - Skip dependency installation
- `--skip-git` - Skip git initialization
- `--directory <path>` - Custom directory for the project

## Learn More

- [Effex Documentation](https://github.com/Balance8/effex)
- [Effect Documentation](https://effect.website)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
