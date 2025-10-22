# effex-gen

CLI tool for generating type-safe Effect-TS services from Prisma or Drizzle schemas.

## Usage

### Drizzle (Default)

Generate Effect schemas and services from your Drizzle schema:

```bash
# Run with defaults (Drizzle is the default generator)
effex-gen

# Or explicitly specify drizzle
effex-gen drizzle

# Accept all defaults without prompts
effex-gen -a
effex-gen --all
```

### Prisma

Generate Effect services from your Prisma schema:

```bash
effex-gen prisma
```

## Options

### Global Options

- `-a, --all` - Accept all defaults without prompts (works with both Drizzle and Prisma)

### Drizzle Options

- `--schema-path <path>` - Path to Drizzle schema file (auto-detected if not provided)
- `--output-dir <path>` - Output directory for generated schemas (defaults to `./packages/database/src/generated/effect`)
- `--services-dir <path>` - Output directory for generated services (defaults to `./packages/api/src/services`)

### Prisma Options

- `--schema-path <path>` - Path to Prisma schema file (auto-detected if not provided)
- `--output-dir <path>` - Output directory for generated files (defaults to `./src/generated/effect`)

## Auto-detection

### Drizzle

The tool automatically searches for your Drizzle schema in common locations:

- `./src/schema.ts`
- `./packages/database/src/schema.ts`
- `../database/src/schema.ts`

### Prisma

The tool automatically searches for your Prisma schema in common locations:

- `./prisma/schema.prisma`
- `./packages/database/prisma/schema.prisma`
- `../prisma/schema.prisma`

## Generated Files

### Drizzle

The tool generates:

- **Schemas** (`packages/database/src/generated/effect/schemas/*.ts`) - Effect Schema definitions for your tables
- **Services** (`packages/api/src/services/*.ts`) - Type-safe Effect services with CRUD operations

### Prisma

The tool generates:

- **Schemas** (`schemas/*.ts`) - Effect Schema definitions for your models
- **Services** (`services/*.ts`) - Type-safe Effect services with all Prisma operations

## Example

### Using Drizzle Services

```typescript
import { Effect } from 'effect';
import { RuntimeServer, UserService } from '@workspace/api';

const program = Effect.gen(function* () {
  const userService = yield* UserService;
  const users = yield* userService.getAllUsers;
  return users;
});

const users = await RuntimeServer.runPromise(program);
```

### Using in Next.js Server Actions

```typescript
'use server';

import { Effect } from 'effect';
import { RuntimeServer, UserService } from '@workspace/api';

export async function getUsersAction() {
  const program = Effect.gen(function* () {
    const userService = yield* UserService;
    return yield* userService.getAllUsers;
  });

  return await RuntimeServer.runPromise(
    program.pipe(
      Effect.match({
        onFailure: (error) => ({ success: false, error: 'Failed to get users' }),
        onSuccess: (users) => ({ success: true, data: users }),
      })
    )
  );
}
```
