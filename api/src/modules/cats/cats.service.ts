import { Inject, Injectable } from '@nestjs/common'
import { eq, desc, sql, and, lt, inArray } from 'drizzle-orm'

import { ErrorCode, NotificationType } from '@shared/types'

import { DB, type Db } from '../../db/db.module'
import {
  cats,
  meows,
  meowTags,
  likes,
  comments,
  follows
} from '../../db/schema'
import { AppException } from '../../common/exceptions'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class CatsService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly notificationsService: NotificationsService
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
      ? and(eq(meows.authorId, cat.id), lt(meows.createdAt, new Date(cursor)))
      : eq(meows.authorId, cat.id)

    const rows = await this.db
      .select({
        id: meows.id,
        content: meows.content,
        imageUrl: meows.imageUrl,
        replyToId: meows.replyToId,
        remeowOfId: meows.remeowOfId,
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
          sex: cats.sex,
          avatarUrl: cats.avatarUrl,
          verified: cats.verified,
          createdAt: cats.createdAt
        }
      })
      .from(meows)
      .innerJoin(cats, eq(meows.authorId, cats.id))
      .where(conditions)
      .orderBy(desc(meows.createdAt))
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const data = rows.slice(0, limit)
    const meowIds = data.map(m => m.id)

    if (meowIds.length === 0) {
      return { data: [], cursor: null, hasMore: false }
    }

    // загружаем все enrichment-данные параллельно
    const refIds = [
      ...new Set([
        ...data.filter(m => m.replyToId).map(m => m.replyToId!),
        ...data.filter(m => m.remeowOfId).map(m => m.remeowOfId!)
      ])
    ]

    const [
      allTags,
      likeCounts,
      commentCounts,
      userLikes,
      remeowCounts,
      userRemeows,
      userReplies,
      previewsMap
    ] = await Promise.all([
      this.db
        .select()
        .from(meowTags)
        .where(inArray(meowTags.meowId, meowIds)),
      this.db
        .select({ meowId: likes.meowId, count: sql<number>`count(*)::int` })
        .from(likes)
        .where(inArray(likes.meowId, meowIds))
        .groupBy(likes.meowId),
      this.db
        .select({ meowId: comments.meowId, count: sql<number>`count(*)::int` })
        .from(comments)
        .where(inArray(comments.meowId, meowIds))
        .groupBy(comments.meowId),
      currentUserId
        ? this.db
            .select({ meowId: likes.meowId })
            .from(likes)
            .where(
              and(inArray(likes.meowId, meowIds), eq(likes.userId, currentUserId))
            )
        : Promise.resolve([] as { meowId: string }[]),
      this.db
        .select({
          remeowOfId: meows.remeowOfId,
          count: sql<number>`count(*)::int`
        })
        .from(meows)
        .where(inArray(meows.remeowOfId, meowIds))
        .groupBy(meows.remeowOfId),
      currentUserId
        ? this.db
            .select({ id: meows.id, remeowOfId: meows.remeowOfId })
            .from(meows)
            .where(
              and(
                inArray(meows.remeowOfId, meowIds),
                eq(meows.authorId, currentUserId)
              )
            )
        : Promise.resolve([] as { id: string; remeowOfId: string | null }[]),
      currentUserId
        ? this.db
            .select({ id: meows.id, replyToId: meows.replyToId })
            .from(meows)
            .where(
              and(
                inArray(meows.replyToId, meowIds),
                eq(meows.authorId, currentUserId)
              )
            )
        : Promise.resolve([] as { id: string; replyToId: string | null }[]),
      refIds.length > 0
        ? this.db
            .select({
              id: meows.id,
              content: meows.content,
              imageUrl: meows.imageUrl,
              createdAt: meows.createdAt,
              author: {
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
              }
            })
            .from(meows)
            .innerJoin(cats, eq(meows.authorId, cats.id))
            .where(inArray(meows.id, refIds))
            .then(rows => new Map(rows.map(p => [p.id, p])))
        : Promise.resolve(new Map<string, any>())
    ])

    const tagsMap = new Map<string, typeof allTags>()
    for (const tag of allTags) {
      const arr = tagsMap.get(tag.meowId) || []
      arr.push(tag)
      tagsMap.set(tag.meowId, arr)
    }

    const likeMap = new Map(likeCounts.map(l => [l.meowId, l.count]))
    const commentMap = new Map(commentCounts.map(c => [c.meowId, c.count]))
    const likedSet = new Set(userLikes.map(l => l.meowId))
    const remeowMap = new Map(remeowCounts.map(r => [r.remeowOfId, r.count]))
    const remeowedSet = new Set(userRemeows.map(r => r.remeowOfId))
    const myRemeowIdMap = new Map(userRemeows.map(r => [r.remeowOfId, r.id]))
    const repliedSet = new Set(userReplies.map(r => r.replyToId))
    const myReplyIdMap = new Map(userReplies.map(r => [r.replyToId, r.id]))

    const result = data.map(meow => ({
      id: meow.id,
      content: meow.content,
      imageUrl: meow.imageUrl,
      createdAt: meow.createdAt,
      updatedAt: meow.updatedAt,
      author: meow.author,
      tags: (tagsMap.get(meow.id) || []).map(t => ({
        id: t.id,
        tag: t.tag,
        position: t.position
      })),
      likesCount: likeMap.get(meow.id) || 0,
      commentsCount: commentMap.get(meow.id) || 0,
      remeowsCount: remeowMap.get(meow.id) || 0,
      isLiked: likedSet.has(meow.id),
      isRemeowed: remeowedSet.has(meow.id),
      myRemeowId: myRemeowIdMap.get(meow.id) || null,
      isReplied: repliedSet.has(meow.id),
      myReplyId: myReplyIdMap.get(meow.id) || null,
      replyTo: meow.replyToId ? previewsMap.get(meow.replyToId) || null : null,
      remeowOf: meow.remeowOfId
        ? previewsMap.get(meow.remeowOfId) || null
        : null
    }))

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
