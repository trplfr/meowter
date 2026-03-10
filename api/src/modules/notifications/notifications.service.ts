import { Inject, Injectable } from '@nestjs/common'
import { eq, desc, sql, and, lt, inArray } from 'drizzle-orm'

import { NotificationType } from '@shared/types'

import { DB, type Db } from '../../db/db.module'
import { notifications, cats, comments } from '../../db/schema'
import { authorSelect } from '../../common/lib'

@Injectable()
export class NotificationsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async create(
    userId: string,
    actorId: string,
    type: NotificationType,
    meowId?: string,
    commentId?: string
  ) {
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

  async getList(
    userId: string,
    cursor?: string,
    limit = 20,
    meowsService?: any
  ) {
    const conditions = cursor
      ? and(
          eq(notifications.userId, userId),
          lt(notifications.createdAt, new Date(cursor))
        )
      : eq(notifications.userId, userId)

    const rows = await this.db
      .select({
        id: notifications.id,
        type: notifications.type,
        meowId: notifications.meowId,
        commentId: notifications.commentId,
        read: notifications.read,
        createdAt: notifications.createdAt,
        actor: authorSelect
      })
      .from(notifications)
      .innerJoin(cats, eq(notifications.actorId, cats.id))
      .where(conditions)
      .orderBy(desc(notifications.createdAt))
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const data = rows.slice(0, limit)

    // загружаем мяуты и комменты параллельно
    const meowIds = [...new Set(data.filter(n => n.meowId).map(n => n.meowId!))]
    const commentIds = [
      ...new Set(data.filter(n => n.commentId).map(n => n.commentId!))
    ]

    let meowsMap = new Map<string, any>()
    let commentsMap = new Map<string, { id: string; content: string }>()

    if (meowIds.length > 0 || commentIds.length > 0) {
      // используем enrichMeows если сервис передан, иначе простая загрузка
      const [enrichedMeows, commentRows] = await Promise.all([
        meowIds.length > 0 && meowsService
          ? meowsService.loadMeowPreviews(meowIds)
          : Promise.resolve(new Map<string, any>()),
        commentIds.length > 0
          ? this.db
              .select({ id: comments.id, content: comments.content })
              .from(comments)
              .where(inArray(comments.id, commentIds))
          : Promise.resolve([])
      ])

      meowsMap = enrichedMeows
      commentsMap = new Map(
        commentRows.map(c => [c.id, { id: c.id, content: c.content }])
      )
    }

    const result = data.map(n => ({
      id: n.id,
      type: n.type,
      actor: n.actor,
      meow: n.meowId ? meowsMap.get(n.meowId) || null : null,
      comment: n.commentId ? commentsMap.get(n.commentId) || null : null,
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
      .where(
        and(eq(notifications.userId, userId), eq(notifications.read, false))
      )

    return { count }
  }

  async markAllRead(userId: string) {
    await this.db
      .update(notifications)
      .set({ read: true })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.read, false))
      )

    return { ok: true }
  }
}
