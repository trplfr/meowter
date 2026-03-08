import { Inject, Injectable } from '@nestjs/common'
import { eq, desc, sql, and, lt, inArray } from 'drizzle-orm'

import { NotificationType } from '@shared/types'

import { DB, type Db } from '../../db/db.module'
import { notifications, cats, meows, meowTags, likes, comments } from '../../db/schema'

@Injectable()
export class NotificationsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async create(userId: string, actorId: string, type: NotificationType, meowId?: string, commentId?: string) {
    // не уведомляем самого себя
    if (userId === actorId) {
      return
    }

    await this.db.insert(notifications).values({
      userId,
      actorId,
      type,
      meowId: meowId || null,
      commentId: commentId || null
    })
  }

  async getList(userId: string, cursor?: string, limit = 20) {
    const conditions = cursor
      ? and(eq(notifications.userId, userId), lt(notifications.createdAt, new Date(cursor)))
      : eq(notifications.userId, userId)

    const rows = await this.db
      .select({
        id: notifications.id,
        type: notifications.type,
        meowId: notifications.meowId,
        commentId: notifications.commentId,
        read: notifications.read,
        createdAt: notifications.createdAt,
        actor: {
          id: cats.id,
          username: cats.username,
          displayName: cats.displayName,
          firstName: cats.firstName,
          lastName: cats.lastName,
          email: cats.email,
          bio: cats.bio,
          contacts: cats.contacts,
          sex: cats.sex,
          avatarUrl: cats.avatarUrl,
          createdAt: cats.createdAt
        }
      })
      .from(notifications)
      .innerJoin(cats, eq(notifications.actorId, cats.id))
      .where(conditions)
      .orderBy(desc(notifications.createdAt))
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const data = rows.slice(0, limit)

    // загружаем мяуты для MEOW_LIKE и COMMENT_LIKE
    const meowIds = [...new Set(data.filter((n) => n.meowId).map((n) => n.meowId!))]

    let meowsMap = new Map<string, any>()
    if (meowIds.length > 0) {

      const meowRows = await this.db
        .select({
          id: meows.id,
          content: meows.content,
          imageUrl: meows.imageUrl,
          createdAt: meows.createdAt,
          updatedAt: meows.updatedAt,
          author: {
            id: cats.id,
            username: cats.username,
            displayName: cats.displayName,
            firstName: cats.firstName,
            lastName: cats.lastName,
            email: cats.email,
            bio: cats.bio,
            contacts: cats.contacts,
            avatarUrl: cats.avatarUrl,
            createdAt: cats.createdAt
          }
        })
        .from(meows)
        .innerJoin(cats, eq(meows.authorId, cats.id))
        .where(inArray(meows.id, meowIds))

      const allTags = await this.db
        .select()
        .from(meowTags)
        .where(inArray(meowTags.meowId, meowIds))

      const likeCounts = await this.db
        .select({
          meowId: likes.meowId,
          count: sql<number>`count(*)::int`
        })
        .from(likes)
        .where(inArray(likes.meowId, meowIds))
        .groupBy(likes.meowId)

      const commentCounts = await this.db
        .select({
          meowId: comments.meowId,
          count: sql<number>`count(*)::int`
        })
        .from(comments)
        .where(inArray(comments.meowId, meowIds))
        .groupBy(comments.meowId)

      const userLikes = await this.db
        .select({ meowId: likes.meowId })
        .from(likes)
        .where(and(
          inArray(likes.meowId, meowIds),
          eq(likes.userId, userId)
        ))

      const tagsMap = new Map<string, typeof allTags>()
      for (const tag of allTags) {
        const arr = tagsMap.get(tag.meowId) || []
        arr.push(tag)
        tagsMap.set(tag.meowId, arr)
      }

      const likeMap = new Map(likeCounts.map((l) => [l.meowId, l.count]))
      const commentMap = new Map(commentCounts.map((c) => [c.meowId, c.count]))
      const likedSet = new Set(userLikes.map((l) => l.meowId))

      for (const meow of meowRows) {
        meowsMap.set(meow.id, {
          ...meow,
          tags: (tagsMap.get(meow.id) || []).map((t) => ({ id: t.id, tag: t.tag, position: t.position })),
          likesCount: likeMap.get(meow.id) || 0,
          commentsCount: commentMap.get(meow.id) || 0,
          isLiked: likedSet.has(meow.id)
        })
      }
    }

    const result = data.map((n) => ({
      id: n.id,
      type: n.type,
      actor: n.actor,
      meow: n.meowId ? meowsMap.get(n.meowId) || null : null,
      read: n.read,
      createdAt: n.createdAt
    }))

    const nextCursor = hasMore
      ? data[data.length - 1].createdAt.toISOString()
      : null

    return { data: result, cursor: nextCursor, hasMore }
  }

  async getUnreadCount(userId: string) {
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))

    return { count }
  }

  async markAllRead(userId: string) {
    await this.db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))

    return { ok: true }
  }
}
