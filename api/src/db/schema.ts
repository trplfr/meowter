import { pgTable, uuid, varchar, text, timestamp, integer, boolean, primaryKey } from 'drizzle-orm/pg-core'

/* Cats */

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
  sex: varchar('sex', { length: 10 }),
  avatarUrl: text('avatar_url'),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

/* Meows */

export const meows = pgTable('meows', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id').references(() => cats.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  replyToId: uuid('reply_to_id'),
  remeowOfId: uuid('remeow_of_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

/* Meow Tags */

export const meowTags = pgTable('meow_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  meowId: uuid('meow_id').references(() => meows.id, { onDelete: 'cascade' }).notNull(),
  tag: varchar('tag', { length: 100 }).notNull(),
  stem: varchar('stem', { length: 100 }).notNull(),
  position: integer('position').notNull()
})

/* Likes */

export const likes = pgTable('likes', {
  userId: uuid('user_id').references(() => cats.id, { onDelete: 'cascade' }).notNull(),
  meowId: uuid('meow_id').references(() => meows.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (t) => [
  primaryKey({ columns: [t.userId, t.meowId] })
])

/* Follows */

export const follows = pgTable('follows', {
  followerId: uuid('follower_id').references(() => cats.id, { onDelete: 'cascade' }).notNull(),
  followingId: uuid('following_id').references(() => cats.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (t) => [
  primaryKey({ columns: [t.followerId, t.followingId] })
])

/* Comments */

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  meowId: uuid('meow_id').references(() => meows.id, { onDelete: 'cascade' }).notNull(),
  authorId: uuid('author_id').references(() => cats.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

/* Comment Likes */

export const commentLikes = pgTable('comment_likes', {
  userId: uuid('user_id').references(() => cats.id, { onDelete: 'cascade' }).notNull(),
  commentId: uuid('comment_id').references(() => comments.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (t) => [
  primaryKey({ columns: [t.userId, t.commentId] })
])

/* Notifications */

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => cats.id, { onDelete: 'cascade' }).notNull(),
  actorId: uuid('actor_id').references(() => cats.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  meowId: uuid('meow_id').references(() => meows.id, { onDelete: 'cascade' }),
  commentId: uuid('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})
