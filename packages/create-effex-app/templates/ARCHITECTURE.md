# Effex Architecture

This document explains how the different packages work together in an Effex application.

## Package Structure

```
packages/
├── database/          # Drizzle schema + Effect client
├── api/              # Effect services (business logic)
└── ui/               # Shared UI components

apps/
├── web/              # Next.js app (server actions)
└── expo/             # React Native app
```

## Data Flow

### Web App (Next.js)

```
Component (RSC)
    ↓
Server Action (apps/web/lib/actions/)
    ↓
Service (@workspace/api/services/)
    ↓
Database (@workspace/database)
```

**Example:**

```typescript
// 1. Component calls server action
// apps/web/app/users/page.tsx
import { getAllUsersAction } from '@/lib/actions/users'

export default async function UsersPage() {
  const result = await getAllUsersAction()
  return <div>{result.data.map(...)}</div>
}

// 2. Server action wraps service
// apps/web/lib/actions/users.ts
'use server'
import { RuntimeServer, UsersService } from '@workspace/api'

export async function getAllUsersAction() {
  const program = Effect.gen(function* () {
    const usersService = yield* UsersService
    return yield* usersService.getAllUsers
  })
  
  return await RuntimeServer.runPromise(program.pipe(...))
}

// 3. Service contains business logic
// packages/api/src/services/UsersService.ts
const makeUsersService = Effect.gen(function* () {
  const drizzle = yield* PgDrizzle.PgDrizzle
  
  return {
    getAllUsers: drizzle.select().from(user).pipe(...)
  }
})
```

### Mobile App (Expo)

Mobile apps can consume the API in two ways:

1. **HTTP calls to Next.js API routes** (recommended for most cases)
2. **Direct service usage** (if running in a server context like Expo Router API routes)

## Key Principles

### 1. Services are Framework-Agnostic

Services in `@workspace/api` use pure Effect-TS and have no framework dependencies. They can be used in:
- Next.js server actions
- Next.js API routes
- Expo Router API routes
- CLI tools
- Background jobs
- Tests

### 2. Server Actions are Next.js-Specific

Server actions in `apps/web/lib/actions/` are Next.js-specific wrappers that:
- Import services from `@workspace/api`
- Handle errors with `Effect.match`
- Call `revalidatePath` / `revalidateTag` for cache invalidation
- Return serializable results

### 3. Database Layer is Isolated

The `@workspace/database` package:
- Contains Drizzle schema definitions
- Provides Effect-TS database client
- Exports generated Effect schemas
- Has no business logic

## Code Generation

### Generate Effect Services

```bash
effex-gen drizzle
```

This generates:
- **Effect schemas** in `packages/database/src/generated/effect/schemas/`
- **Effect services** in `packages/api/src/services/`

### What Gets Generated

For each table in your Drizzle schema:

1. **Schemas** (`@workspace/database/effect/schemas/`)
   - `selectUserSchema` - For reading data
   - `insertUserSchema` - For creating data
   - Type exports

2. **Services** (`@workspace/api/services/`)
   - `UserService` - CRUD operations
   - Error types (`UserNotFound`, `DatabaseError`)
   - Effect-based methods (getAllUsers, getUserById, createUser, updateUser, deleteUser)

## Error Handling

Services use Effect-TS error handling with tagged errors:

```typescript
export class UserNotFound extends Schema.TaggedError<UserNotFound>()('UserNotFound', {
  id: Schema.String,
}) {}

export class DatabaseError extends Schema.TaggedError<DatabaseError>()('DatabaseError', {
  cause: Schema.Unknown,
}) {}
```

Server actions handle these errors:

```typescript
return await RuntimeServer.runPromise(
  program.pipe(
    Effect.match({
      onFailure: Match.valueTags({
        UserNotFound: () => ({ success: false, error: 'User not found' }),
        DatabaseError: () => ({ success: false, error: 'Database error' }),
      }),
      onSuccess: data => ({ success: true, data }),
    })
  )
)
```

## Runtime

Each app has its own runtime:

- **RuntimeServer** (`@workspace/api`) - Server-side runtime with all services
- **RuntimeClient** (apps) - Client-side runtime (usually empty or minimal)

The RuntimeServer provides all services with proper dependency injection:

```typescript
const MainLayer = Layer.mergeAll(
  UsersService.Live,
  PostsService.Live,
  // ... other services
).pipe(Layer.provide(DatabaseLive))

export const RuntimeServer = ManagedRuntime.make(MainLayer)
```

## Best Practices

1. **Keep services pure** - No framework-specific code in `@workspace/api`
2. **Use server actions for Next.js** - Don't call services directly from components
3. **Handle all errors** - Use `Effect.match` to handle all error cases
4. **Revalidate caches** - Call `revalidatePath` after mutations
5. **Type everything** - Use generated schemas for validation
6. **Test services** - Services are easy to test with Effect.runPromise

## Example: Adding a New Feature

1. **Update Drizzle schema** (`packages/database/src/schema.ts`)
2. **Run migrations** (`bun db:push`)
3. **Generate code** (`bun x effex-gen drizzle`)
4. **Create server actions** (`apps/web/lib/actions/posts.ts`)
5. **Use in components** (`apps/web/app/posts/page.tsx`)

The generated services and routers give you a head start, but you can always add custom methods to services or create new services for complex business logic.

