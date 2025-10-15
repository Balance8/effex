import 'server-only'

import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { eq } from 'drizzle-orm'
import { Context, Effect, Layer, Schema } from 'effect'

import { User } from '@workspace/database/drizzle/schema'

export class DatabaseError extends Schema.TaggedError<DatabaseError>()('DatabaseError', {
  cause: Schema.Unknown,
}) {}

export class UserNotFound extends Schema.TaggedError<UserNotFound>()('UserNotFound', {
  id: Schema.String,
}) {}

const makeUsersService = Effect.gen(function* () {
  const drizzle = yield* PgDrizzle.PgDrizzle

  return {
    getAllUsers: drizzle
      .select()
      .from(User)
      .pipe(Effect.mapError(error => new DatabaseError({ cause: error }))),

    getUserById: (id: string) =>
      drizzle
        .select()
        .from(User)
        .where(eq(User.id, id))
        .pipe(
          Effect.mapError(error => new DatabaseError({ cause: error })),
          Effect.flatMap(result =>
            result[0] ? Effect.succeed(result[0]) : Effect.fail(new UserNotFound({ id }))
          )
        ),
  }
})

export class UsersService extends Context.Tag('UsersService')<
  UsersService,
  Effect.Effect.Success<typeof makeUsersService>
>() {
  static readonly Live = Layer.effect(UsersService, makeUsersService)
}
