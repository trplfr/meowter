import { describe, it, expect, beforeEach, vi } from 'vitest'

import { AppException } from '../../../common/exceptions'
import { AuthService } from '../auth.service'

/* Mocks */

// результаты запросов, выбираются по порядку
let queryResults: any[] = []
let queryIndex = 0

// каждый вызов select/insert/update создает независимую цепочку
const createQueryChain = (resolve: () => any) => {
  const chain: any = {}
  chain.from = vi.fn().mockReturnValue(chain)
  chain.where = vi.fn().mockReturnValue(chain)
  chain.limit = vi.fn().mockImplementation(() => resolve())
  chain.values = vi.fn().mockReturnValue(chain)
  chain.returning = vi.fn().mockImplementation(() => resolve())
  chain.set = vi.fn().mockReturnValue(chain)
  chain.groupBy = vi.fn().mockReturnValue(chain)
  // для запросов без limit/returning = then-able
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
  transaction: vi.fn()
}

const mockRedis = {
  set: vi.fn(),
  get: vi.fn(),
  del: vi.fn()
}

const mockJwt = {
  sign: vi.fn().mockReturnValue('mock-access-token')
}

const mockConfig = {
  getOrThrow: vi.fn().mockReturnValue('15m'),
  get: vi.fn().mockReturnValue('Meowter <noreply@meowter.app>')
}

const mockEmail = {
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined)
}

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn()
}))

import * as bcrypt from 'bcrypt'

const createService = () => {
  return new AuthService(
    mockDb as any,
    mockRedis as any,
    mockJwt as any,
    mockConfig as any,
    mockEmail as any
  )
}

describe('AuthService', () => {
  let service: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    queryResults = []
    queryIndex = 0
    service = createService()
  })

  describe('register', () => {
    it('создает пользователя и возвращает токены', async () => {
      queryResults = [
        [], // email check (select -> limit)
        [], // username check (select -> limit)
        [{ // insert -> returning
          id: '1',
          username: 'whiskers',
          email: 'whiskers@meowter.app',
          displayName: 'whiskers',
          avatarUrl: null,
          emailVerified: false,
          verified: false
        }]
      ]

      const result = await service.register({
        username: 'whiskers',
        email: 'whiskers@meowter.app',
        password: 'MyStr0ngP@ss'
      }, 'https://meowter.app')

      expect(result.user.username).toBe('whiskers')
      expect(result.accessToken).toBe('mock-access-token')
      expect(result.refreshToken).toBeDefined()
      expect(mockRedis.set).toHaveBeenCalled()
    })

    it('бросает AppException если email занят', async () => {
      queryResults = [
        [{ id: '1' }] // email check = found
      ]

      await expect(
        service.register({
          username: 'whiskers',
          email: 'whiskers@meowter.app',
          password: 'MyStr0ngP@ss'
        }, 'https://meowter.app')
      ).rejects.toThrow(AppException)
    })

    it('бросает AppException если username занят', async () => {
      queryResults = [
        [], // email = free
        [{ id: '1' }] // username = taken
      ]

      await expect(
        service.register({
          username: 'whiskers',
          email: 'new@meowter.app',
          password: 'MyStr0ngP@ss'
        }, 'https://meowter.app')
      ).rejects.toThrow(AppException)
    })
  })

  describe('login', () => {
    it('возвращает токены при верных данных', async () => {
      queryResults = [
        [{ // select user
          id: '1',
          username: 'whiskers',
          email: 'whiskers@meowter.app',
          displayName: 'whiskers',
          avatarUrl: null,
          emailVerified: false,
          verified: false,
          passwordHash: 'hashed-password'
        }]
      ]
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never)

      const result = await service.login({
        email: 'whiskers@meowter.app',
        password: 'MyStr0ngP@ss'
      })

      expect(result.user.username).toBe('whiskers')
      expect(result.accessToken).toBe('mock-access-token')
    })

    it('бросает AppException при неверной почте', async () => {
      queryResults = [
        [] // user not found
      ]

      await expect(
        service.login({ email: 'wrong@meowter.app', password: 'pass' })
      ).rejects.toThrow(AppException)
    })

    it('бросает AppException при неверном пароле', async () => {
      queryResults = [
        [{
          id: '1',
          username: 'whiskers',
          email: 'whiskers@meowter.app',
          passwordHash: 'hashed-password'
        }]
      ]
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never)

      await expect(
        service.login({ email: 'whiskers@meowter.app', password: 'wrong' })
      ).rejects.toThrow(AppException)
    })
  })

  describe('refresh', () => {
    it('выдает новые токены по валидному refresh token', async () => {
      mockRedis.get.mockResolvedValueOnce('user-id-1')
      queryResults = [
        [{ // select user
          id: 'user-id-1',
          username: 'whiskers',
          email: 'whiskers@meowter.app',
          displayName: 'whiskers',
          avatarUrl: null,
          emailVerified: false,
          verified: false
        }]
      ]

      const result = await service.refresh('valid-refresh-token')

      expect(result.accessToken).toBe('mock-access-token')
      expect(mockRedis.del).toHaveBeenCalledWith('refresh:valid-refresh-token')
    })

    it('бросает AppException при невалидном refresh token', async () => {
      mockRedis.get.mockResolvedValueOnce(null)

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        AppException
      )
    })
  })

  describe('logout', () => {
    it('удаляет refresh token из Redis', async () => {
      await service.logout('some-refresh-token')

      expect(mockRedis.del).toHaveBeenCalledWith('refresh:some-refresh-token')
    })
  })

  describe('me', () => {
    it('возвращает профиль пользователя с подписками', async () => {
      queryResults = [
        [{ // select user
          id: '1',
          username: 'whiskers',
          email: 'whiskers@meowter.app',
          displayName: 'whiskers',
          bio: null,
          avatarUrl: null,
          createdAt: new Date()
        }],
        [{ count: 5 }], // followingCount (Promise.all)
        [{ count: 10 }] // followersCount (Promise.all)
      ]

      const result = await service.me({ sub: '1', username: 'whiskers' })

      expect(result.username).toBe('whiskers')
      expect(result.followingCount).toBe(5)
      expect(result.followersCount).toBe(10)
      expect(result.isOwn).toBe(true)
    })

    it('бросает AppException если пользователь не найден', async () => {
      queryResults = [
        [] // user not found
      ]

      await expect(
        service.me({ sub: 'non-existent', username: 'ghost' })
      ).rejects.toThrow(AppException)
    })
  })
})
