import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const user = pgTable("user", (t) => ({
  id: t.text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  email: t.text().notNull().unique(),
  name: t.text(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp().notNull().defaultNow().$onUpdateFn(() => new Date()),
}))

