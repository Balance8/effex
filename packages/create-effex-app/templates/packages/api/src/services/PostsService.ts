import 'server-only'

import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { eq } from 'drizzle-orm'
import { Context, Effect, Layer, Schema } from 'effect'

import { Post } from '@workspace/database/drizzle/schema'
import { selectPostSchema } from '@workspace/database/effect/post-schemas'
import type { InsertPost } from '@workspace/database/effect/post-types'

export class PostNotFound extends Schema.TaggedError<PostNotFound>()('PostNotFound', {
  id: Schema.String,
}) {}

export class DatabaseError extends Schema.TaggedError<DatabaseError>()('DatabaseError', {
  cause: Schema.Unknown,
}) {}

const makePostsService = Effect.gen(function* () {
  const drizzle = yield* PgDrizzle.PgDrizzle

  return {
    getAllPosts: drizzle
      .select()
      .from(Post)
      .pipe(
        Effect.mapError(error => new DatabaseError({ cause: error })),
        Effect.flatMap(posts =>
          Effect.all(posts.map(p => Schema.decodeUnknown(selectPostSchema)(p)))
        )
      ),

    getPostById: (id: string) =>
      drizzle
        .select()
        .from(Post)
        .where(eq(Post.id, id))
        .limit(1)
        .pipe(
          Effect.mapError(error => new DatabaseError({ cause: error })),
          Effect.flatMap(result =>
            result[0] ? Effect.succeed(result[0]) : Effect.fail(new PostNotFound({ id }))
          ),
          Effect.flatMap(p => Schema.decodeUnknown(selectPostSchema)(p))
        ),

    getPostsByAuthor: (authorId: string) =>
      drizzle
        .select()
        .from(Post)
        .where(eq(Post.authorId, authorId))
        .pipe(
          Effect.mapError(error => new DatabaseError({ cause: error })),
          Effect.flatMap(posts =>
            Effect.all(posts.map(p => Schema.decodeUnknown(selectPostSchema)(p)))
          )
        ),

    createPost: (data: InsertPost) =>
      drizzle
        .insert(Post)
        .values(data)
        .returning()
        .pipe(
          Effect.mapError(error => new DatabaseError({ cause: error })),
          Effect.flatMap(result =>
            result[0]
              ? Effect.succeed(result[0])
              : Effect.fail(new DatabaseError({ cause: 'No post returned after insert' }))
          ),
          Effect.flatMap(p => Schema.decodeUnknown(selectPostSchema)(p))
        ),

    updatePost: (id: string, data: Partial<InsertPost>) =>
      Effect.gen(function* () {
        const [updatedPost] = yield* drizzle
          .update(Post)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(Post.id, id))
          .returning()
          .pipe(
            Effect.mapError(error => new DatabaseError({ cause: error })),
            Effect.flatMap(result =>
              result.length > 0 ? Effect.succeed(result) : Effect.fail(new PostNotFound({ id }))
            )
          )

        return yield* Schema.decodeUnknown(selectPostSchema)(updatedPost)
      }),

    deletePost: (id: string) =>
      Effect.gen(function* () {
        const existingPost = yield* drizzle
          .select()
          .from(Post)
          .where(eq(Post.id, id))
          .limit(1)
          .pipe(
            Effect.mapError(error => new DatabaseError({ cause: error })),
            Effect.flatMap(result =>
              result[0] ? Effect.succeed(result[0]) : Effect.fail(new PostNotFound({ id }))
            )
          )

        yield* drizzle
          .delete(Post)
          .where(eq(Post.id, id))
          .pipe(Effect.mapError(error => new DatabaseError({ cause: error })))

        return yield* Schema.decodeUnknown(selectPostSchema)(existingPost)
      }),
  }
})

export class PostsService extends Context.Tag('PostsService')<
  PostsService,
  Effect.Effect.Success<typeof makePostsService>
>() {
  static readonly Live = Layer.effect(PostsService, makePostsService)
}

