# {{projectName}}

A modern full-stack application built with:

- **Turbo Repo** - Monorepo build system
- **Next.js** - React framework for web
- **Expo** - React Native framework for mobile (iOS/Android)
- **NativeWind v5** - Tailwind CSS v4 for React Native
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

#### Quick Start (Recommended)

The fastest way to get started is using Prisma's built-in local database:

1. Start a local Prisma Postgres instance:

```bash
{{packageManager}} run db:dev
```

2. Copy the connection string from the output to `.env`:

```bash
cp .env.example .env
```

Then paste the connection string:
```env
DATABASE_URL="postgres://user:pass@localhost:5432/dbname"
```

3. Push schema to database:

```bash
{{packageManager}} run db:push
```

4. (Optional) Seed the database:

```bash
{{packageManager}} run db:seed
```

#### Using External PostgreSQL

If you prefer to use your own PostgreSQL database:

1. Copy `.env.example` to `.env` and configure your database URL:

```bash
cp .env.example .env
```

2. Generate Prisma client:

```bash
{{packageManager}} run db:generate
```

> **Note:** This generates both the Prisma client and Effect-TS services from your schema.

3. Run database migrations:

```bash
{{packageManager}} run db:migrate
```

4. (Optional) Seed the database:

```bash
{{packageManager}} run db:seed
```

### Development

Start all development servers:

```bash
{{packageManager}} run dev
```

Or start individual apps:

```bash
# Web app only
{{packageManager}} run dev:web

# Expo app only
{{packageManager}} run dev:expo
```

The web app will be available at [http://localhost:3000](http://localhost:3000).

For the Expo app, see [apps/expo/README.md](apps/expo/README.md) for mobile development instructions.

## Working with Effect Services

This project includes type-safe Effect-TS services automatically generated from your Prisma schema. These services are committed to version control, so you can use them immediately:

```typescript
import { Effect } from 'effect';
import { UserService } from '@workspace/database/effect/services/UserService';

const program = Effect.gen(function* () {
  const userService = yield* UserService;
  const users = yield* userService.findMany();
  return users;
});
```

When you modify your Prisma schema, regenerate the services by running `{{packageManager}} run db:generate` and commit the changes.

## Project Structure

```
{{projectName}}/
├── apps/
│   ├── web/              # Next.js application
│   └── expo/             # Expo React Native app
├── packages/
│   ├── database/         # Prisma schema and database utilities
│   ├── tailwind-config/  # Shared Tailwind CSS theme
│   ├── typescript-config/# Shared TypeScript configurations
│   └── ui/              # Shared UI components
├── biome.jsonc          # Biome configuration
├── turbo.json           # Turbo configuration
└── package.json         # Root package.json
```

## Available Scripts

### Build & Development

- `{{packageManager}} run dev` - Start all development servers
- `{{packageManager}} run dev:web` - Start web app only
- `{{packageManager}} run dev:expo` - Start Expo app only
- `{{packageManager}} run build` - Build all packages

### Code Quality

- `{{packageManager}} run format-and-lint` - Check code formatting and linting
- `{{packageManager}} run format-and-lint:fix` - Fix code formatting and linting issues

### Database

- `{{packageManager}} run db:dev` - Start local Prisma Postgres instance
- `{{packageManager}} run db:generate` - Generate Prisma client and Effect services
- `{{packageManager}} run db:migrate` - Run database migrations
- `{{packageManager}} run db:push` - Push schema to database
- `{{packageManager}} run db:seed` - Seed the database
- `{{packageManager}} run db:studio` - Open Prisma Studio

### Effect Services

- `{{packageManager}} run effect:generate` - Regenerate Effect services from Prisma schema (auto-runs with db:generate)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev)
- [NativeWind Documentation](https://www.nativewind.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Effect Documentation](https://effect.website)
- [Turbo Documentation](https://turbo.build/repo/docs)
- [Biome Documentation](https://biomejs.dev)
