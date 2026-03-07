import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const cats = pgTable('cats', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 30 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 50 }).notNull(),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  bio: text('bio'),
  contacts: varchar('contacts', { length: 255 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})
