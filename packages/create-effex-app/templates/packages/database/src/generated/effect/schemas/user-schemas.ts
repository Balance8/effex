import { Schema } from 'effect'

export const selectUserSchema = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  name: Schema.NullOr(Schema.String),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
})

export const insertUserSchema = Schema.Struct({
  id: Schema.optional(Schema.String),
  email: Schema.String,
  name: Schema.optional(Schema.NullOr(Schema.String)),
  createdAt: Schema.optional(Schema.Date),
  updatedAt: Schema.optional(Schema.Date),
})

export type SelectUser = typeof selectUserSchema.Type
export type InsertUser = typeof insertUserSchema.Type

