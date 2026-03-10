import { Inject, Injectable } from '@nestjs/common'
import { eq, desc, sql, and, lt, isNull } from 'drizzle-orm'

import { ErrorCode, NotificationType } from '@shared/types'

import { DB, type Db } from '../../db/db.module'
import { cats, meows, follows } from '../../db/schema'
import { AppException } from '../../common/exceptions'
import { authorSelect } from '../../common/lib'
import { NotificationsService } from '../notifications/notifications.service'
import { MeowsService } from '../meows/meows.service'

@Injectable()
export class CatsService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly notificationsService: NotificationsService,
    private readonly meowsService: MeowsService
  ) {}

  async getProfile(username: string, currentUserId?: string) {
    const [cat] = await this.db
      .select({
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
        verified: cats.verified,
        createdAt: cats.createdAt
      })
      .from(cats)
      .where(eq(cats.username, username))
      .limit(1)

    if (!cat) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 404, 'User not found')
    }

    // параллельно загружаем счетчики и проверку подписки
    const [
      [{ count: followingCount }],
      [{ count: followersCount }],
      followRow
    ] = await Promise.all([
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(follows)
        .where(eq(follows.followerId, cat.id)),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(follows)
        .where(eq(follows.followingId, cat.id)),
      currentUserId && currentUserId !== cat.id
        ? this.db
            .select({ followerId: follows.followerId })
            .from(follows)
            .where(
              and(
                eq(follows.followerId, currentUserId),
                eq(follows.followingId, cat.id)
              )
            )
            .limit(1)
        : Promise.resolve([])
    ])

    return {
      ...cat,
      followingCount,
      followersCount,
      isFollowing: followRow.length > 0,
      isOwn: currentUserId === cat.id
    }
  }

  async getUserMeows(
    username: string,
    currentUserId?: string,
    cursor?: string,
    limit = 20
  ) {
    const [cat] = await this.db
      .select({ id: cats.id })
      .from(cats)
      .where(eq(cats.username, username))
      .limit(1)

    if (!cat) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 404, 'User not found')
    }

    const conditions = cursor
      ? and(eq(meows.authorId, cat.id), lt(meows.createdAt, new Date(cursor)), isNull(meows.deletedAt))
      : and(eq(meows.authorId, cat.id), isNull(meows.deletedAt))

    const rows = await this.db
      .select({
        id: meows.id,
        content: meows.content,
        imageUrl: meows.imageUrl,
        replyToId: meows.replyToId,
        remeowOfId: meows.remeowOfId,
        createdAt: meows.createdAt,
        updatedAt: meows.updatedAt,
        author: authorSelect
      })
      .from(meows)
      .innerJoin(cats, eq(meows.authorId, cats.id))
      .where(conditions)
      .orderBy(desc(meows.createdAt))
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const data = rows.slice(0, limit)

    if (data.length === 0) {
      return { data: [], cursor: null, hasMore: false }
    }

    const result = await this.meowsService.enrichMeows(data, currentUserId)

    const nextCursor = hasMore
      ? data[data.length - 1].createdAt.toISOString()
      : null

    return { data: result, cursor: nextCursor, hasMore }
  }

  async follow(currentUserId: string, username: string) {
    const [target] = await this.db
      .select({ id: cats.id })
      .from(cats)
      .where(eq(cats.username, username))
      .limit(1)

    if (!target) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 404, 'User not found')
    }

    if (target.id === currentUserId) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        400,
        'Cannot follow yourself'
      )
    }

    await this.db
      .insert(follows)
      .values({ followerId: currentUserId, followingId: target.id })
      .onConflictDoNothing()

    // уведомление
    await this.notificationsService.create(
      target.id,
      currentUserId,
      NotificationType.FOLLOW
    )

    return { ok: true }
  }

  async unfollow(currentUserId: string, username: string) {
    const [target] = await this.db
      .select({ id: cats.id })
      .from(cats)
      .where(eq(cats.username, username))
      .limit(1)

    if (!target) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 404, 'User not found')
    }

    await this.db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, currentUserId),
          eq(follows.followingId, target.id)
        )
      )

    return { ok: true }
  }
}
