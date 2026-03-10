import { describe, it, expect, beforeEach, vi } from 'vitest'

import { ErrorCode } from '@shared/types'

import { AppException } from '../../../common/exceptions'
import { MeowsService } from '../meows.service'

/* Mocks */

let queryResults: any[] = []
let queryIndex = 0

const createQueryChain = (resolve: () => any) => {
  const chain: any = {}
  chain.from = vi.fn().mockReturnValue(chain)
  chain.where = vi.fn().mockReturnValue(chain)
  chain.limit = vi.fn().mockImplementation(() => resolve())
  chain.values = vi.fn().mockReturnValue(chain)
  chain.returning = vi.fn().mockImplementation(() => resolve())
  chain.set = vi.fn().mockReturnValue(chain)
  chain.groupBy = vi.fn().mockReturnValue(chain)
  chain.orderBy = vi.fn().mockReturnValue(chain)
  chain.offset = vi.fn().mockReturnValue(chain)
  chain.innerJoin = vi.fn().mockReturnValue(chain)
  chain.onConflictDoNothing = vi.fn().mockImplementation(() => resolve())
  chain.then = (fn: any) => Promise.resolve(resolve()).then(fn)
  return chain
}

const mockDb: any = {
  select: vi.fn().mockImplementation(() => {
    const idx = queryIndex++
    return createQueryChain(() => queryResults[idx])
  }),
  insert: vi.fn().mockImplementation(() => {
    const idx = queryIndex++
    return createQueryChain(() => queryResults[idx])
  }),
  update: vi.fn().mockImplementation(() => {
    const idx = queryIndex++
    return createQueryChain(() => queryResults[idx])
  }),
  delete: vi.fn().mockImplementation(() => {
    const idx = queryIndex++
    return createQueryChain(() => queryResults[idx])
  }),
  execute: vi.fn(),
  transaction: vi.fn()
}

const mockNotifications = {
  create: vi.fn()
}

const createService = () => {
  return new MeowsService(
    mockDb as any,
    mockNotifications as any
  )
}

describe('MeowsService', () => {
  let service: MeowsService

  beforeEach(() => {
    vi.clearAllMocks()
    queryResults = []
    queryIndex = 0
    service = createService()
  })

  describe('create', () => {
    it('бросает 404 если оригинальный мяут не найден', async () => {
      queryResults = [
        [] // original not found
      ]

      await expect(
        service.create('user-1', { content: 'reply' }, null, 'non-existent')
      ).rejects.toThrow(AppException)
    })

    it('сохраняет authorId из первого запроса для уведомления', async () => {
      const originalAuthorId = 'original-author'

      // первый запрос: проверка существования + получение authorId
      queryResults = [
        [{ id: 'original-meow', authorId: originalAuthorId }]
      ]

      const createdMeow = {
        id: 'reply-1',
        authorId: 'user-1',
        content: 'reply text',
        imageUrl: null,
        replyToId: 'original-meow',
        remeowOfId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDb.transaction.mockImplementation(async (fn: any) => {
        const tx = {
          insert: vi.fn().mockImplementation(() =>
            createQueryChain(() => [createdMeow])
          )
        }
        return fn(tx)
      })

      // мокаем findById чтобы не проваливаться в его сложную логику
      const findByIdSpy = vi.spyOn(service, 'findById').mockResolvedValue({
        id: 'reply-1',
        content: 'reply text'
      } as any)

      await service.create('user-1', { content: 'reply text' }, null, 'original-meow')

      // уведомление отправлено с authorId из первого запроса (без повторного запроса)
      expect(mockNotifications.create).toHaveBeenCalledWith(
        originalAuthorId,
        'user-1',
        'REPLY',
        'reply-1'
      )

      // findById вызван с meow.id и authorId
      expect(findByIdSpy).toHaveBeenCalledWith('reply-1', 'user-1')

      findByIdSpy.mockRestore()
    })

    it('не отправляет уведомление для не-reply', async () => {
      const createdMeow = {
        id: 'meow-1',
        authorId: 'user-1',
        content: 'hello ~world',
        imageUrl: null,
        replyToId: null,
        remeowOfId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDb.transaction.mockImplementation(async (fn: any) => {
        const tx = {
          insert: vi.fn().mockImplementation(() =>
            createQueryChain(() => [createdMeow])
          )
        }
        return fn(tx)
      })

      vi.spyOn(service, 'findById').mockResolvedValue({ id: 'meow-1' } as any)

      await service.create('user-1', { content: 'hello ~world' }, null)

      expect(mockNotifications.create).not.toHaveBeenCalled()
    })
  })

  describe('enrichMeows', () => {
    it('возвращает пустой массив для пустых данных', async () => {
      const result = await service.enrichMeows([], 'user-1')
      expect(result).toEqual([])
    })

    it('обогащает мяуты тегами, каунтами и взаимодействиями', async () => {
      const meowData = [{
        id: 'meow-1',
        content: 'hello',
        imageUrl: null,
        replyToId: null,
        remeowOfId: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        author: { id: 'a1', username: 'cat' }
      }]

      queryResults = [
        // allTags
        [{ id: 't1', meowId: 'meow-1', tag: 'test', position: 0 }],
        // likeCounts
        [{ meowId: 'meow-1', count: 5 }],
        // commentCounts
        [{ meowId: 'meow-1', count: 3 }],
        // remeowCounts
        [{ remeowOfId: 'meow-1', count: 1 }],
        // userLikes
        [{ meowId: 'meow-1' }],
        // userRemeows
        [{ id: 'remeow-1', remeowOfId: 'meow-1' }],
        // userReplies
        []
        // loadMeowPreviews = не вызывается (нет refIds)
      ]

      const result = await service.enrichMeows(meowData, 'user-1')

      expect(result).toHaveLength(1)
      expect(result[0].likesCount).toBe(5)
      expect(result[0].commentsCount).toBe(3)
      expect(result[0].remeowsCount).toBe(1)
      expect(result[0].isLiked).toBe(true)
      expect(result[0].isRemeowed).toBe(true)
      expect(result[0].myRemeowId).toBe('remeow-1')
      expect(result[0].tags).toHaveLength(1)
      expect(result[0].tags[0].tag).toBe('test')
    })

    it('работает без currentUserId (гость)', async () => {
      const meowData = [{
        id: 'meow-1',
        content: 'hello',
        imageUrl: null,
        replyToId: null,
        remeowOfId: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        author: { id: 'a1', username: 'cat' }
      }]

      queryResults = [
        [], // allTags
        [{ meowId: 'meow-1', count: 2 }], // likeCounts
        [], // commentCounts
        [] // remeowCounts
        // userLikes, userRemeows, userReplies = Promise.resolve([])
      ]

      const result = await service.enrichMeows(meowData)

      expect(result[0].isLiked).toBe(false)
      expect(result[0].isRemeowed).toBe(false)
      expect(result[0].likesCount).toBe(2)
    })

    it('загружает preview для replyTo и remeowOf', async () => {
      const meowData = [{
        id: 'meow-1',
        content: 'reply',
        imageUrl: null,
        replyToId: 'original-1',
        remeowOfId: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        author: { id: 'a1', username: 'cat' }
      }]

      queryResults = [
        [], // allTags
        [], // likeCounts
        [], // commentCounts
        [], // remeowCounts
        [], // userLikes
        [], // userRemeows
        [], // userReplies
        // loadMeowPreviews: select from meows
        [{ id: 'original-1', content: 'original content', imageUrl: null, createdAt: new Date(), author: { id: 'a2', username: 'other' } }]
      ]

      const result = await service.enrichMeows(meowData, 'user-1')

      expect(result[0].replyTo).toBeTruthy()
      expect(result[0].replyTo.id).toBe('original-1')
    })
  })

  describe('like', () => {
    it('лайкает мяут и отправляет уведомление', async () => {
      queryResults = [
        [{ id: 'meow-1', authorId: 'author-1' }], // select meow
        undefined // insert like (onConflictDoNothing)
      ]

      const result = await service.like('meow-1', 'user-1')

      expect(result).toEqual({ ok: true })
      expect(mockNotifications.create).toHaveBeenCalledWith(
        'author-1', 'user-1', 'MEOW_LIKE', 'meow-1'
      )
    })

    it('бросает 404 для несуществующего мяута', async () => {
      queryResults = [
        [] // meow not found
      ]

      await expect(
        service.like('non-existent', 'user-1')
      ).rejects.toThrow(AppException)
    })
  })

  describe('unlike', () => {
    it('удаляет лайк', async () => {
      queryResults = [undefined]

      const result = await service.unlike('meow-1', 'user-1')
      expect(result).toEqual({ ok: true })
    })
  })

  describe('delete', () => {
    it('soft-delete мяута', async () => {
      queryResults = [
        [{ id: 'meow-1', authorId: 'user-1' }], // select meow
        undefined // update set deletedAt
      ]

      const result = await service.delete('meow-1', 'user-1')

      expect(result).toEqual({ ok: true })
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('бросает UNAUTHORIZED если не автор', async () => {
      queryResults = [
        [{ id: 'meow-1', authorId: 'other-user' }]
      ]

      try {
        await service.delete('meow-1', 'user-1')
        expect.unreachable('should have thrown')
      } catch (e: any) {
        expect(e).toBeInstanceOf(AppException)
        expect(e.code).toBe(ErrorCode.UNAUTHORIZED)
      }
    })

    it('бросает 404 для несуществующего мяута', async () => {
      queryResults = [[]]

      await expect(
        service.delete('non-existent', 'user-1')
      ).rejects.toThrow(AppException)
    })
  })

  describe('deleteComment', () => {
    it('удаляет свой комментарий', async () => {
      queryResults = [
        [{ id: 'comment-1', authorId: 'user-1' }], // select comment
        undefined // delete
      ]

      const result = await service.deleteComment('comment-1', 'user-1')
      expect(result).toEqual({ ok: true })
    })

    it('бросает UNAUTHORIZED для чужого комментария', async () => {
      queryResults = [
        [{ id: 'comment-1', authorId: 'other-user' }]
      ]

      try {
        await service.deleteComment('comment-1', 'user-1')
        expect.unreachable('should have thrown')
      } catch (e: any) {
        expect(e).toBeInstanceOf(AppException)
        expect(e.code).toBe(ErrorCode.UNAUTHORIZED)
      }
    })

    it('бросает 404 для несуществующего комментария', async () => {
      queryResults = [[]]

      await expect(
        service.deleteComment('non-existent', 'user-1')
      ).rejects.toThrow(AppException)
    })
  })

  describe('likeComment', () => {
    it('бросает 404 для несуществующего комментария', async () => {
      queryResults = [[]]

      await expect(
        service.likeComment('non-existent', 'user-1')
      ).rejects.toThrow(AppException)
    })
  })

  describe('loadMeowPreviews', () => {
    it('возвращает пустой Map для пустого массива', async () => {
      const result = await service.loadMeowPreviews([])
      expect(result.size).toBe(0)
    })
  })
})
