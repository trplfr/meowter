import { Inject, Injectable } from '@nestjs/common'
import { eq, asc, desc, sql, and, lt, gt, inArray } from 'drizzle-orm'

import { ErrorCode, NotificationType } from '@shared/types'

import { DB, type Db } from '../../db/db.module'
import { meows, meowTags, likes, comments, commentLikes, cats } from '../../db/schema'
import { AppException } from '../../common/exceptions'
import { NotificationsService } from '../notifications/notifications.service'

import type { CreateMeowDto, CreateCommentDto } from './dto'

// парсит @username из текста
const parseMentions = (content: string): string[] => {
  const regex = /@([\w\u0400-\u04FFёЁ]+)/g
  const usernames: string[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    const username = match[1].toLowerCase()
    if (!usernames.includes(username)) {
      usernames.push(username)
    }
  }

  return usernames
}

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

// общий select для автора
const authorSelect = {
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

@Injectable()
export class MeowsService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly notificationsService: NotificationsService
  ) {}

  async create(authorId: string, dto: CreateMeowDto, imageUrl: string | null, replyToId?: string) {
    // если это ответ, проверяем что оригинальный мяут существует
    if (replyToId) {
      const [original] = await this.db
        .select({ id: meows.id })
        .from(meows)
        .where(eq(meows.id, replyToId))
        .limit(1)

      if (!original) {
        throw new AppException(ErrorCode.MEOW_NOT_FOUND, 404, 'Original meow not found')
      }
    }

    const [meow] = await this.db
      .insert(meows)
      .values({
        authorId,
        content: dto.content,
        imageUrl,
        replyToId: replyToId || null
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

    // уведомление автору оригинального мяута о reply
    if (replyToId) {
      const [original] = await this.db
        .select({ authorId: meows.authorId })
        .from(meows)
        .where(eq(meows.id, replyToId))
        .limit(1)

      if (original) {
        await this.notificationsService.create(original.authorId, authorId, NotificationType.REPLY, meow.id)
      }
    }

    return this.findById(meow.id, authorId)
  }

  async remeow(meowId: string, userId: string) {
    // проверяем существование оригинала
    const [original] = await this.db
      .select({ id: meows.id, authorId: meows.authorId, remeowOfId: meows.remeowOfId })
      .from(meows)
      .where(eq(meows.id, meowId))
      .limit(1)

    if (!original) {
      throw new AppException(ErrorCode.MEOW_NOT_FOUND, 404, 'Meow not found')
    }

    // если ремяутят ремяут, берем оригинал
    const targetId = original.remeowOfId || original.id

    // проверяем нет ли уже ремяута
    const [existing] = await this.db
      .select({ id: meows.id })
      .from(meows)
      .where(and(eq(meows.authorId, userId), eq(meows.remeowOfId, targetId)))
      .limit(1)

    if (existing) {
      throw new AppException(ErrorCode.VALIDATION_ERROR, 400, 'Already remeowed')
    }

    const [remeow] = await this.db
      .insert(meows)
      .values({
        authorId: userId,
        content: '',
        remeowOfId: targetId
      })
      .returning()

    // уведомление автору оригинала
    const [originalMeow] = await this.db
      .select({ authorId: meows.authorId })
      .from(meows)
      .where(eq(meows.id, targetId))
      .limit(1)

    if (originalMeow) {
      await this.notificationsService.create(originalMeow.authorId, userId, NotificationType.REMEOW, targetId)
    }

    return this.findById(remeow.id, userId)
  }

  async undoRemeow(meowId: string, userId: string) {
    const [remeow] = await this.db
      .select({ id: meows.id })
      .from(meows)
      .where(and(eq(meows.authorId, userId), eq(meows.remeowOfId, meowId)))
      .limit(1)

    if (!remeow) {
      throw new AppException(ErrorCode.MEOW_NOT_FOUND, 404, 'Remeow not found')
    }

    await this.db.delete(meows).where(eq(meows.id, remeow.id))

    return { ok: true }
  }

  // загружает preview мяута (для replyTo / remeowOf)
  private async loadMeowPreview(id: string) {
    const [row] = await this.db
      .select({
        id: meows.id,
        content: meows.content,
        imageUrl: meows.imageUrl,
        createdAt: meows.createdAt,
        author: authorSelect
      })
      .from(meows)
      .innerJoin(cats, eq(meows.authorId, cats.id))
      .where(eq(meows.id, id))
      .limit(1)

    return row || null
  }

  // батч-загрузка preview для множества мяутов
  private async loadMeowPreviews(ids: string[]) {
    if (ids.length === 0) {
      return new Map<string, any>()
    }

    const rows = await this.db
      .select({
        id: meows.id,
        content: meows.content,
        imageUrl: meows.imageUrl,
        createdAt: meows.createdAt,
        author: authorSelect
      })
      .from(meows)
      .innerJoin(cats, eq(meows.authorId, cats.id))
      .where(inArray(meows.id, ids))

    return new Map(rows.map((r) => [r.id, r]))
  }

  async findById(id: string, currentUserId?: string) {
    const [meow] = await this.db
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

    const [{ count: remeowsCount }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(meows)
      .where(eq(meows.remeowOfId, id))

    let isLiked = false
    let isRemeowed = false
    let myRemeowId: string | null = null
    let isReplied = false
    let myReplyId: string | null = null
    if (currentUserId) {
      const [like] = await this.db
        .select({ userId: likes.userId })
        .from(likes)
        .where(and(eq(likes.meowId, id), eq(likes.userId, currentUserId)))
        .limit(1)
      isLiked = !!like

      const [remeow] = await this.db
        .select({ id: meows.id })
        .from(meows)
        .where(and(eq(meows.authorId, currentUserId), eq(meows.remeowOfId, id)))
        .limit(1)
      isRemeowed = !!remeow
      myRemeowId = remeow?.id || null

      const [reply] = await this.db
        .select({ id: meows.id })
        .from(meows)
        .where(and(eq(meows.authorId, currentUserId), eq(meows.replyToId, id)))
        .limit(1)
      isReplied = !!reply
      myReplyId = reply?.id || null
    }

    // загрузка replyTo / remeowOf
    const replyTo = meow.replyToId ? await this.loadMeowPreview(meow.replyToId) : null
    const remeowOf = meow.remeowOfId ? await this.loadMeowPreview(meow.remeowOfId) : null

    return {
      id: meow.id,
      content: meow.content,
      imageUrl: meow.imageUrl,
      createdAt: meow.createdAt,
      updatedAt: meow.updatedAt,
      author: meow.author,
      tags,
      likesCount,
      commentsCount,
      remeowsCount,
      isLiked,
      isRemeowed,
      myRemeowId,
      isReplied,
      myReplyId,
      replyTo,
      remeowOf
    }
  }

  async getUserTags(userId: string): Promise<string[]> {
    // теги из собственных мяутов
    const ownTags = await this.db
      .selectDistinctOn([meowTags.stem], { tag: meowTags.tag, stem: meowTags.stem })
      .from(meowTags)
      .innerJoin(meows, eq(meowTags.meowId, meows.id))
      .where(eq(meows.authorId, userId))

    // теги из ремяутов (оригинальный пост содержит теги)
    const remeowTags = await this.db
      .selectDistinctOn([meowTags.stem], { tag: meowTags.tag, stem: meowTags.stem })
      .from(meows)
      .innerJoin(meowTags, eq(meowTags.meowId, meows.remeowOfId))
      .where(and(eq(meows.authorId, userId), sql`${meows.remeowOfId} IS NOT NULL`))

    // объединяем уникальные стемы
    const stemSet = new Set<string>()
    const result: string[] = []

    for (const row of [...ownTags, ...remeowTags]) {
      if (!stemSet.has(row.stem)) {
        stemSet.add(row.stem)
        result.push(row.tag)
      }
    }

    return result
  }

  // SQL-условие сопоставления тегов: exact stem + prefix (длинные) + levenshtein (короткие) + stem levenshtein
  private tagMatchCondition(tag: string) {
    return sql`(
      ${meowTags.stem} = stem_tag(${tag})
      OR (length(${tag}) >= 4 AND lower(${meowTags.tag}) LIKE lower(${tag}) || '%' AND length(${meowTags.tag}) >= length(${tag}) + 3)
      OR (length(${meowTags.tag}) >= 4 AND lower(${tag}) LIKE lower(${meowTags.tag}) || '%' AND length(${tag}) >= length(${meowTags.tag}) + 3)
      OR (least(length(${tag}), length(${meowTags.tag})) < 4 AND lower(${meowTags.tag}) LIKE lower(${tag}) || '%' AND levenshtein(lower(${tag}), lower(${meowTags.tag})) <= 2)
      OR (least(length(${tag}), length(${meowTags.tag})) < 4 AND lower(${tag}) LIKE lower(${meowTags.tag}) || '%' AND levenshtein(lower(${tag}), lower(${meowTags.tag})) <= 2)
      OR (least(length(${meowTags.stem}), length(stem_tag(${tag}))) >= 4
          AND length(${meowTags.stem}) <> length(stem_tag(${tag}))
          AND levenshtein(${meowTags.stem}, stem_tag(${tag})) <= 1)
    )`
  }

  // находит meowIds по тегу
  private async findMeowIdsByTag(tag: string): Promise<string[]> {
    const rows = await this.db
      .select({ meowId: meowTags.meowId })
      .from(meowTags)
      .where(this.tagMatchCondition(tag))

    return rows.map((r) => r.meowId)
  }

  // проверяет, есть ли у пользователя доступ к тегу (писал сам или ремяукал)
  private async userHasTag(userId: string, tag: string): Promise<boolean> {
    // проверка в собственных мяутах
    const [ownTag] = await this.db
      .select({ meowId: meowTags.meowId })
      .from(meowTags)
      .innerJoin(meows, eq(meowTags.meowId, meows.id))
      .where(and(
        eq(meows.authorId, userId),
        this.tagMatchCondition(tag)
      ))
      .limit(1)

    if (ownTag) {
      return true
    }

    // проверка в ремяутах
    const [remeowTag] = await this.db
      .select({ meowId: meowTags.meowId })
      .from(meows)
      .innerJoin(meowTags, eq(meowTags.meowId, meows.remeowOfId))
      .where(and(
        eq(meows.authorId, userId),
        this.tagMatchCondition(tag)
      ))
      .limit(1)

    return !!remeowTag
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

  async getFeed(currentUserId: string, cursor?: string, limit = 20, tag?: string, sort: 'date' | 'popular' = 'date') {
    // определяем тег для фильтрации
    const feedTag = tag || (await this.getLastTag(currentUserId))

    // если тег передан явно, проверяем доступ (писал сам или ремяукал)
    if (tag && feedTag) {
      const hasAccess = await this.userHasTag(currentUserId, feedTag)
      if (!hasAccess) {
        return { data: [], cursor: null, hasMore: false, tag: feedTag }
      }
    }

    // если есть тег, находим meowIds с этим тегом
    let taggedMeowIds: string[] | null = null
    if (feedTag) {
      taggedMeowIds = await this.findMeowIdsByTag(feedTag)

      if (taggedMeowIds.length === 0) {
        return { data: [], cursor: null, hasMore: false, tag: feedTag }
      }
    }

    // для popular сортировки используем offset-пагинацию
    const isPopular = sort === 'popular'
    const offset = isPopular && cursor ? parseInt(cursor, 10) : 0

    const conditions: ReturnType<typeof eq>[] = []

    // cursor-пагинация только для date-сортировки
    if (cursor && !isPopular) {
      conditions.push(lt(meows.createdAt, new Date(cursor)))
    }

    if (taggedMeowIds) {
      conditions.push(inArray(meows.id, taggedMeowIds))
    }

    // подзапрос количества лайков для сортировки по популярности
    const likesCountSq = sql`(SELECT count(*) FROM ${likes} WHERE ${likes.meowId} = ${meows.id})`

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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(isPopular ? desc(likesCountSq) : desc(meows.createdAt), desc(meows.createdAt))
      .limit(limit + 1)
      .offset(offset)

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

    // remeow counts
    const remeowCounts = await this.db
      .select({
        remeowOfId: meows.remeowOfId,
        count: sql<number>`count(*)::int`
      })
      .from(meows)
      .where(inArray(meows.remeowOfId, meowIds))
      .groupBy(meows.remeowOfId)

    // проверка isRemeowed для текущего пользователя
    const userRemeows = await this.db
      .select({ id: meows.id, remeowOfId: meows.remeowOfId })
      .from(meows)
      .where(and(
        inArray(meows.remeowOfId, meowIds),
        eq(meows.authorId, currentUserId)
      ))

    // проверка isReplied для текущего пользователя
    const userReplies = await this.db
      .select({ id: meows.id, replyToId: meows.replyToId })
      .from(meows)
      .where(and(
        inArray(meows.replyToId, meowIds),
        eq(meows.authorId, currentUserId)
      ))

    // загружаем replyTo / remeowOf previews
    const refIds = [...new Set([
      ...data.filter((m) => m.replyToId).map((m) => m.replyToId!),
      ...data.filter((m) => m.remeowOfId).map((m) => m.remeowOfId!)
    ])]
    const previewsMap = await this.loadMeowPreviews(refIds)

    const tagsMap = new Map<string, typeof allTags>()
    for (const tag of allTags) {
      const arr = tagsMap.get(tag.meowId) || []
      arr.push(tag)
      tagsMap.set(tag.meowId, arr)
    }

    const likeMap = new Map(likeCounts.map((l) => [l.meowId, l.count]))
    const commentMap = new Map(commentCounts.map((c) => [c.meowId, c.count]))
    const likedSet = new Set(userLikes.map((l) => l.meowId))
    const remeowMap = new Map(remeowCounts.map((r) => [r.remeowOfId, r.count]))
    const remeowedSet = new Set(userRemeows.map((r) => r.remeowOfId))
    const myRemeowIdMap = new Map(userRemeows.map((r) => [r.remeowOfId, r.id]))
    const repliedSet = new Set(userReplies.map((r) => r.replyToId))
    const myReplyIdMap = new Map(userReplies.map((r) => [r.replyToId, r.id]))

    const result = data.map((meow) => ({
      id: meow.id,
      content: meow.content,
      imageUrl: meow.imageUrl,
      createdAt: meow.createdAt,
      updatedAt: meow.updatedAt,
      author: meow.author,
      tags: (tagsMap.get(meow.id) || []).map((t) => ({
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
      remeowOf: meow.remeowOfId ? previewsMap.get(meow.remeowOfId) || null : null
    }))

    // для popular = offset-курсор, для date = createdAt-курсор
    const nextCursor = hasMore
      ? isPopular
        ? String(offset + limit)
        : data[data.length - 1].createdAt.toISOString()
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
      ? and(eq(comments.meowId, meowId), gt(comments.createdAt, new Date(cursor)))
      : eq(comments.meowId, meowId)

    const rows = await this.db
      .select({
        id: comments.id,
        meowId: comments.meowId,
        content: comments.content,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
        author: authorSelect
      })
      .from(comments)
      .innerJoin(cats, eq(comments.authorId, cats.id))
      .where(conditions)
      .orderBy(asc(comments.createdAt))
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
        verified: cats.verified,
        createdAt: cats.createdAt
      })
      .from(cats)
      .where(eq(cats.id, authorId))
      .limit(1)

    // уведомления для @упоминаний
    const mentionedUsernames = parseMentions(dto.content)
    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await this.db
        .select({ id: cats.id, username: cats.username })
        .from(cats)
        .where(inArray(sql`lower(${cats.username})`, mentionedUsernames))

      for (const user of mentionedUsers) {
        await this.notificationsService.create(user.id, authorId, NotificationType.MENTION, meowId, comment.id)
      }
    }

    return { ...comment, author, isLiked: false, likesCount: 0 }
  }

  async deleteComment(commentId: string, userId: string) {
    const [comment] = await this.db
      .select({ id: comments.id, authorId: comments.authorId })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1)

    if (!comment) {
      throw new AppException(ErrorCode.MEOW_NOT_FOUND, 404, 'Comment not found')
    }

    if (comment.authorId !== userId) {
      throw new AppException(ErrorCode.UNAUTHORIZED, 403, 'Not your comment')
    }

    await this.db.delete(comments).where(eq(comments.id, commentId))

    return { ok: true }
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
