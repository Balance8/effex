# effex

CLI tool for generating type-safe Effect-TS services from Prisma schemas.

## Usage

Generate Effect services from your Prisma schema:

```bash
effex gen
```

Or use the full command:

```bash
effex generate
```

## Options

- `--schema-path <path>` - Path to Prisma schema file (auto-detected if not provided)
- `--output-dir <path>` - Output directory for generated files (defaults to `./src/generated/effect`)

## Auto-detection

The tool automatically searches for your Prisma schema in common locations:
- `./prisma/schema.prisma`
- `./packages/database/prisma/schema.prisma`
- `../prisma/schema.prisma`

## Generated Files

The tool generates:
- **Schemas** (`schemas/*.ts`) - Effect Schema definitions for your models
- **Services** (`services/*.ts`) - Type-safe Effect services with all Prisma operations

## Example

```typescript
import { Effect } from 'effect'
import { UserService } from '@workspace/database/effect/services/UserService'

const program = Effect.gen(function* () {
  const userService = yield* UserService
  const users = yield* userService.findMany()
  return users
})
```

