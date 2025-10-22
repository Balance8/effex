import { Effect, Match } from 'effect'

import { RuntimeServer, UsersService } from '@workspace/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'

const main = Effect.gen(function* () {
  const usersService = yield* UsersService
  const allUsers = yield* usersService.getAllUsers
  return allUsers
})

export default async function UsersPage() {
  const result = await RuntimeServer.runPromise(
    main.pipe(
      Effect.match({
        onFailure: error => {
          console.error('Failed to load users:', error)
          return { success: false as const, error: 'Failed to load users' }
        },
        onSuccess: userList => ({ success: true as const, data: userList }),
      })
    )
  )

  if (!result.success) {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center p-24'>
        <p className='text-destructive'>Error: {result.error}</p>
      </main>
    )
  }

  const users = result.data

  return (
    <main className='flex min-h-screen flex-col items-center p-24'>
      <div className='z-10 w-full max-w-5xl'>
        <h1 className='mb-8 font-bold text-4xl'>Users</h1>
        
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle>{user.name || 'Unnamed User'}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm'>
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No users found</CardTitle>
              <CardDescription>
                There are no users in the database yet.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </main>
  )
}

