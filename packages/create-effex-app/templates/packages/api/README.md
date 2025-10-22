# @workspace/api

Effect-TS services for your application.

## What's in this package?

### Services (`src/services/`)

Framework-agnostic Effect-TS services that encapsulate business logic and database operations. These can be used in:

- Next.js server actions (web app)
- API routes
- Background jobs
- CLI tools
- Any other Effect-TS context

**Example:**

```typescript
import { Effect } from 'effect'
import { RuntimeServer, UsersService } from '@workspace/api'

const program = Effect.gen(function* () {
  const usersService = yield* UsersService
  const users = yield* usersService.getAllUsers
  return users
})

const users = await RuntimeServer.runPromise(program)
```

## Usage in Next.js (Web App)

Services are consumed via **server actions** in the web app:

```typescript
// apps/web/lib/actions/users.ts
'use server'

import { Effect } from 'effect'
import { RuntimeServer, UsersService } from '@workspace/api'

export async function getAllUsersAction() {
  const program = Effect.gen(function* () {
    const usersService = yield* UsersService
    return yield* usersService.getAllUsers
  })

  return await RuntimeServer.runPromise(
    program.pipe(
      Effect.match({
        onFailure: error => ({ success: false, error: 'Failed to get users' }),
        onSuccess: users => ({ success: true, data: users }),
      })
    )
  )
}
```

Then in your components:

```typescript
// apps/web/app/users/page.tsx
import { getAllUsersAction } from '@/lib/actions/users'

export default async function UsersPage() {
  const result = await getAllUsersAction()

  if (!result.success) {
    return <div>Error: {result.error}</div>
  }

  return <div>{result.data.map(user => ...)}</div>
}
```

## Usage in Expo (Mobile App)

For mobile, you can either:

1. **Call Next.js API routes** that use the services
2. **Use services directly** if running in a server context (e.g., Expo Router API routes)

## Architecture

```text
@workspace/api (services)
    ↓
apps/web (server actions) → components
apps/expo (API calls or direct service usage)
```

**Key principle:** Services are framework-agnostic. Server actions are Next.js-specific wrappers around services.

