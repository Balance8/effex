import 'server-only'

import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { eq } from 'drizzle-orm'
import { Context, Effect, Layer, Schema } from 'effect'

import type { InsertUser } from '@workspace/database/effect/schemas/user-schemas'
import { selectUserSchema } from '@workspace/database/effect/schemas/user-schemas'
import { user } from '@workspace/database/schema'

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
      .from(user)
      .pipe(
        Effect.mapError(error => new DatabaseError({ cause: error })),
        Effect.flatMap(users =>
          Effect.all(users.map(u => Schema.decodeUnknown(selectUserSchema)(u)))
        )
      ),

    getUserById: (id: string) =>
      drizzle
        .select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1)
        .pipe(
          Effect.mapError(error => new DatabaseError({ cause: error })),
          Effect.flatMap(result =>
            result[0] ? Effect.succeed(result[0]) : Effect.fail(new UserNotFound({ id }))
          ),
          Effect.flatMap(u => Schema.decodeUnknown(selectUserSchema)(u))
        ),

    createUser: (data: InsertUser) =>
      drizzle
        .insert(user)
        .values(data)
        .returning()
        .pipe(
          Effect.mapError(error => new DatabaseError({ cause: error })),
          Effect.flatMap(result =>
            result[0]
              ? Effect.succeed(result[0])
              : Effect.fail(new DatabaseError({ cause: 'No user returned after insert' }))
          ),
          Effect.flatMap(u => Schema.decodeUnknown(selectUserSchema)(u))
        ),

    updateUser: (id: string, data: Partial<InsertUser>) =>
      Effect.gen(function* () {
        const existingUser = yield* drizzle
          .select()
          .from(user)
          .where(eq(user.id, id))
          .limit(1)
          .pipe(
            Effect.mapError(error => new DatabaseError({ cause: error })),
            Effect.flatMap(result =>
              result[0] ? Effect.succeed(result[0]) : Effect.fail(new UserNotFound({ id }))
            )
          )

        const [updatedUser] = yield* drizzle
          .update(user)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(user.id, id))
          .returning()
          .pipe(
            Effect.mapError(error => new DatabaseError({ cause: error })),
            Effect.flatMap(result =>
              result.length > 0 ? Effect.succeed(result) : Effect.fail(new UserNotFound({ id }))
            )
          )

        return yield* Schema.decodeUnknown(selectUserSchema)(updatedUser)
      }),

    deleteUser: (id: string) =>
      Effect.gen(function* () {
        const existingUser = yield* drizzle
          .select()
          .from(user)
          .where(eq(user.id, id))
          .limit(1)
          .pipe(
            Effect.mapError(error => new DatabaseError({ cause: error })),
            Effect.flatMap(result =>
              result[0] ? Effect.succeed(result[0]) : Effect.fail(new UserNotFound({ id }))
            )
          )

        yield* drizzle
          .delete(user)
          .where(eq(user.id, id))
          .pipe(Effect.mapError(error => new DatabaseError({ cause: error })))

        return yield* Schema.decodeUnknown(selectUserSchema)(existingUser)
      }),
  }
})

export class UsersService extends Context.Tag('UsersService')<
  UsersService,
  Effect.Effect.Success<typeof makeUsersService>
>() {
  static readonly Live = Layer.effect(UsersService, makeUsersService)
}

