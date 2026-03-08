import { Inject, Injectable } from '@nestjs/common'
import { eq, desc, sql, and, lt, inArray } from 'drizzle-orm'

import { ErrorCode, NotificationType } from '@shared/types'

import { DB, type Db } from '../../db/db.module'
import { meows, meowTags, likes, comments, commentLikes, cats } from '../../db/schema'
import { AppException } from '../../common/exceptions'
import { NotificationsService } from '../notifications/notifications.service'

import type { CreateMeowDto, CreateCommentDto } from './dto'

// парсит ~слова из текста
const parseTildes = (content: string) => {
  const regex = /~([\w\u0400-\u04FFёЁ]+)/g
  const tags: { tag: string; position: number }[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    tags.push({ tag: match[1], position: match.index })
  }

  return tags
}

@Injectable()
export class MeowsService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly notificationsService: NotificationsService
  ) {}

  async create(authorId: string, dto: CreateMeowDto, imageUrl: string | null) {
    const [meow] = await this.db
      .insert(meows)
      .values({
        authorId,
        content: dto.content,
        imageUrl
      })
      .returning()

    const tags = parseTildes(dto.content)

    if (tags.length > 0) {
      await this.db.insert(meowTags).values(
        tags.map((t) => ({
          meowId: meow.id,
          tag: t.tag,
          stem: sql`stem_tag(${t.tag})`,
          position: t.position
        }))
      )
    }

    return this.findById(meow.id, authorId)
  }

  async findById(id: string, currentUserId?: string) {
    const [meow] = await this.db
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
          sex: cats.sex,
          avatarUrl: cats.avatarUrl,
          createdAt: cats.createdAt
        }
      })
      .from(meows)
      .innerJoin(cats, eq(meows.authorId, cats.id))
      .where(eq(meows.id, id))
      .limit(1)

    if (!meow) {
      throw new AppException(ErrorCode.MEOW_NOT_FOUND, 404, 'Meow not found')
    }

    const tags = await this.db
      .select({ id: meowTags.id, tag: meowTags.tag, position: meowTags.position })
      .from(meowTags)
      .where(eq(meowTags.meowId, id))

    const [{ count: likesCount }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(likes)
      .where(eq(likes.meowId, id))

    const [{ count: commentsCount }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(comments)
      .where(eq(comments.meowId, id))

    let isLiked = false
    if (currentUserId) {
      const [like] = await this.db
        .select({ userId: likes.userId })
        .from(likes)
        .where(and(eq(likes.meowId, id), eq(likes.userId, currentUserId)))
        .limit(1)
      isLiked = !!like
    }

    return {
      ...meow,
      tags,
      likesCount,
      commentsCount,
      isLiked
    }
  }

  async getUserTags(userId: string): Promise<string[]> {
    const rows = await this.db
      .selectDistinctOn([meowTags.stem], { tag: meowTags.tag })
      .from(meowTags)
      .innerJoin(meows, eq(meowTags.meowId, meows.id))
      .where(eq(meows.authorId, userId))

    return rows.map((r) => r.tag)
  }

  // находит последний тег из последнего meow пользователя
  private async getLastTag(userId: string): Promise<string | null> {
    const [row] = await this.db
      .select({ tag: meowTags.tag })
      .from(meowTags)
      .innerJoin(meows, eq(meowTags.meowId, meows.id))
      .where(eq(meows.authorId, userId))
      .orderBy(desc(meows.createdAt), desc(meowTags.position))
      .limit(1)

    if (!row) {
      return null
    }

    return row.tag
  }

  async getFeed(currentUserId: string, cursor?: string, limit = 20, tag?: string) {
    // определяем тег для фильтрации
    const feedTag = tag || (await this.getLastTag(currentUserId))

    // если есть тег, находим meowIds с этим тегом (матчим по стему)
    let taggedMeowIds: string[] | null = null
    if (feedTag) {
      const tagged = await this.db
        .select({ meowId: meowTags.meowId })
        .from(meowTags)
        .where(sql`${meowTags.stem} = stem_tag(${feedTag})`)

      taggedMeowIds = tagged.map((t) => t.meowId)

      if (taggedMeowIds.length === 0) {
        return { data: [], cursor: null, hasMore: false, tag: feedTag }
      }
    }

    const conditions: ReturnType<typeof eq>[] = []

    if (cursor) {
      conditions.push(lt(meows.createdAt, new Date(cursor)))
    }

    if (taggedMeowIds) {
      conditions.push(inArray(meows.id, taggedMeowIds))
    }

    const rows = await this.db
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
          sex: cats.sex,
          avatarUrl: cats.avatarUrl,
          createdAt: cats.createdAt
        }
      })
      .from(meows)
      .innerJoin(cats, eq(meows.authorId, cats.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(meows.createdAt))
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const data = rows.slice(0, limit)

    // загружаем теги, лайки, комменты для всех meows
    const meowIds = data.map((m) => m.id)

    if (meowIds.length === 0) {
      return { data: [], cursor: null, hasMore: false }
    }

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
        eq(likes.userId, currentUserId)
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

    const result = data.map((meow) => ({
      ...meow,
      tags: (tagsMap.get(meow.id) || []).map((t) => ({
        id: t.id,
        tag: t.tag,
        position: t.position
      })),
      likesCount: likeMap.get(meow.id) || 0,
      commentsCount: commentMap.get(meow.id) || 0,
      isLiked: likedSet.has(meow.id)
    }))

    const nextCursor = hasMore
      ? data[data.length - 1].createdAt.toISOString()
      : null

    return { data: result, cursor: nextCursor, hasMore, tag: feedTag || null }
  }

  async like(meowId: string, userId: string) {
    const [meow] = await this.db
      .select({ id: meows.id, authorId: meows.authorId })
      .from(meows)
      .where(eq(meows.id, meowId))
      .limit(1)

    if (!meow) {
      throw new AppException(ErrorCode.MEOW_NOT_FOUND, 404, 'Meow not found')
    }

    await this.db
      .insert(likes)
      .values({ userId, meowId })
      .onConflictDoNothing()

    // уведомление автору мяута
    await this.notificationsService.create(meow.authorId, userId, NotificationType.MEOW_LIKE, meowId)

    return { ok: true }
  }

  async unlike(meowId: string, userId: string) {
    await this.db
      .delete(likes)
      .where(and(eq(likes.meowId, meowId), eq(likes.userId, userId)))

    return { ok: true }
  }

  async getComments(meowId: string, currentUserId?: string, cursor?: string, limit = 20) {
    const conditions = cursor
      ? and(eq(comments.meowId, meowId), lt(comments.createdAt, new Date(cursor)))
      : eq(comments.meowId, meowId)

    const rows = await this.db
      .select({
        id: comments.id,
        meowId: comments.meowId,
        content: comments.content,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
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
          createdAt: cats.createdAt
        }
      })
      .from(comments)
      .innerJoin(cats, eq(comments.authorId, cats.id))
      .where(conditions)
      .orderBy(desc(comments.createdAt))
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const data = rows.slice(0, limit)

    if (data.length === 0) {
      return { data: [], cursor: null, hasMore: false }
    }

    const commentIds = data.map((c) => c.id)

    // лайки комментариев
    const likeCounts = await this.db
      .select({
        commentId: commentLikes.commentId,
        count: sql<number>`count(*)::int`
      })
      .from(commentLikes)
      .where(inArray(commentLikes.commentId, commentIds))
      .groupBy(commentLikes.commentId)

    const likeMap = new Map(likeCounts.map((l) => [l.commentId, l.count]))

    let likedSet = new Set<string>()
    if (currentUserId) {
      const userLikes = await this.db
        .select({ commentId: commentLikes.commentId })
        .from(commentLikes)
        .where(and(
          inArray(commentLikes.commentId, commentIds),
          eq(commentLikes.userId, currentUserId)
        ))
      likedSet = new Set(userLikes.map((l) => l.commentId))
    }

    const result = data.map((comment) => ({
      ...comment,
      likesCount: likeMap.get(comment.id) || 0,
      isLiked: likedSet.has(comment.id)
    }))

    const nextCursor = hasMore
      ? data[data.length - 1].createdAt.toISOString()
      : null

    return { data: result, cursor: nextCursor, hasMore }
  }

  async createComment(meowId: string, authorId: string, dto: CreateCommentDto) {
    const [meow] = await this.db
      .select({ id: meows.id })
      .from(meows)
      .where(eq(meows.id, meowId))
      .limit(1)

    if (!meow) {
      throw new AppException(ErrorCode.MEOW_NOT_FOUND, 404, 'Meow not found')
    }

    const [comment] = await this.db
      .insert(comments)
      .values({
        meowId,
        authorId,
        content: dto.content
      })
      .returning()

    const [author] = await this.db
      .select({
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
      })
      .from(cats)
      .where(eq(cats.id, authorId))
      .limit(1)

    return { ...comment, author, isLiked: false, likesCount: 0 }
  }

  async likeComment(commentId: string, userId: string) {
    const [comment] = await this.db
      .select({ id: comments.id, authorId: comments.authorId, meowId: comments.meowId })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1)

    if (!comment) {
      throw new AppException(ErrorCode.MEOW_NOT_FOUND, 404, 'Comment not found')
    }

    await this.db
      .insert(commentLikes)
      .values({ userId, commentId })
      .onConflictDoNothing()

    // уведомление автору комментария
    await this.notificationsService.create(comment.authorId, userId, NotificationType.COMMENT_LIKE, comment.meowId, commentId)

    return { ok: true }
  }

  async unlikeComment(commentId: string, userId: string) {
    await this.db
      .delete(commentLikes)
      .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)))

    return { ok: true }
  }

  async delete(id: string, userId: string) {
    const [meow] = await this.db
      .select({ id: meows.id, authorId: meows.authorId })
      .from(meows)
      .where(eq(meows.id, id))
      .limit(1)

    if (!meow) {
      throw new AppException(ErrorCode.MEOW_NOT_FOUND, 404, 'Meow not found')
    }

    if (meow.authorId !== userId) {
      throw new AppException(ErrorCode.UNAUTHORIZED, 403, 'Not your meow')
    }

    await this.db.delete(meows).where(eq(meows.id, id))

    return { ok: true }
  }
}
