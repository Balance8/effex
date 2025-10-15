# {{projectName}}

A modern full-stack application built with:

- **Turbo Repo** - Monorepo build system
- **Next.js** - React framework
- **Prisma** - Database ORM
- **Effect-TS** - Functional programming library
- **Biome** - Fast formatter and linter with Ultracite rules

## Getting Started

### Prerequisites

- Node.js 20+
- {{packageManager}}

### Installation

Dependencies should already be installed. If not, run:

```bash
{{packageManager}} install
```

### Database Setup

1. Copy `.env.example` to `.env` and configure your database URL:

```bash
cp apps/web/.env.example apps/web/.env
```

2. Generate Prisma client and run migrations:

```bash
{{packageManager}} run db:generate
{{packageManager}} run db:migrate
```

3. (Optional) Seed the database:

```bash
{{packageManager}} run db:seed
```

### Development

Start the development server:

```bash
{{packageManager}} run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
{{projectName}}/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   ├── database/         # Prisma schema and database utilities
│   ├── typescript-config/# Shared TypeScript configurations
│   └── ui/              # Shared UI components
├── biome.jsonc          # Biome configuration
├── turbo.json           # Turbo configuration
└── package.json         # Root package.json
```

## Available Scripts

- `{{packageManager}} run dev` - Start development server
- `{{packageManager}} run build` - Build all packages
- `{{packageManager}} run format-and-lint` - Check code formatting and linting
- `{{packageManager}} run format-and-lint:fix` - Fix code formatting and linting issues
- `{{packageManager}} run db:generate` - Generate Prisma client
- `{{packageManager}} run db:migrate` - Run database migrations
- `{{packageManager}} run db:seed` - Seed the database
- `{{packageManager}} run db:studio` - Open Prisma Studio

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Effect Documentation](https://effect.website)
- [Turbo Documentation](https://turbo.build/repo/docs)
- [Biome Documentation](https://biomejs.dev)

