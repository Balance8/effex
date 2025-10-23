# Database Package

This package contains the database schema, migrations, and generated clients for the application.

## Quick Start with Prisma Dev

The easiest way to get started is using Prisma's built-in local database:

```bash
bun run db:dev
```

This command starts a local serverless PostgreSQL instance and outputs a connection string like:
```
postgres://user:pass@localhost:5432/dbname
```

Copy this connection string to your `.env` file:
```env
DATABASE_URL="postgres://user:pass@localhost:5432/dbname"
```

## Available Scripts

- `db:dev` - Start a local Prisma Postgres instance (instant setup, no Docker required)
- `db:generate` - Generate Prisma client, Drizzle schemas, and Effect schemas
- `db:migrate` - Run database migrations
- `db:push` - Push schema changes to database without migrations
- `db:studio` - Open Prisma Studio to view/edit data
- `db:seed` - Seed the database with sample data

## Development Workflow

### Option 1: Local Prisma Dev (Recommended for Quick Start)

1. Start the local database:
   ```bash
   bun run db:dev
   ```

2. Copy the connection string to `.env`

3. Generate schemas:
   ```bash
   bun run db:generate
   ```

4. Push schema to database:
   ```bash
   bun run db:push
   ```

5. Seed with sample data:
   ```bash
   bun run db:seed
   ```

### Option 2: External PostgreSQL Database

1. Set up your PostgreSQL database (local, Docker, or cloud)

2. Add connection string to `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
   ```

3. Generate schemas:
   ```bash
   bun run db:generate
   ```

4. Run migrations:
   ```bash
   bun run db:migrate
   ```

5. Seed with sample data:
   ```bash
   bun run db:seed
   ```

## Schema Architecture

This package uses a multi-layer schema approach:

1. **Prisma Schema** (`prisma/schema.prisma`) - Source of truth
2. **Drizzle Schema** (`src/generated/drizzle/schema.ts`) - Generated from Prisma
3. **Effect Schemas** (`src/generated/effect/*.ts`) - Type-safe schemas with validation

### Schema Generation Flow

```
Prisma Schema
    ↓ (prisma generate)
Drizzle Schema
    ↓ (fix-updated-at.ts)
Fixed Drizzle Schema
    ↓ (generate-effect-schemas.ts)
Effect Schemas (Insert/Select/Types/Forms)
```

## Clients

### Drizzle Client (Node.js)
```typescript
import { db } from '@workspace/database/drizzle/client'
```

### Effect Client (Functional)
```typescript
import { DatabaseLive } from '@workspace/database/effect/client'
```

## Adding New Models

1. Edit `prisma/schema.prisma`
2. Run `bun run db:generate`
3. Run `bun run db:push` or `bun run db:migrate`
4. Effect schemas are automatically generated

## Prisma MCP Server (AI Integration)

For AI-assisted database management, you can use the Prisma MCP server:

```bash
npx prisma mcp
```

Then configure your AI tool (Cursor, Claude, etc.) to use it for commands like:
- "Create a new database and give me the connection string"
- "List all connection strings"
- "Push schema to cloud"

