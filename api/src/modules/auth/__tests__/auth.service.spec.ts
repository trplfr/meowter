import { describe, it, expect, beforeEach, vi } from 'vitest'

import { AppException } from '../../../common/exceptions'
import { AuthService } from '../auth.service'

/* Mocks */

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis()
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
  getOrThrow: vi.fn().mockReturnValue('15m')
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
    mockConfig as any
  )
}

describe('AuthService', () => {
  let service: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    service = createService()
  })

  describe('register', () => {
    it('создает пользователя и возвращает токены', async () => {
      // email check
      mockDb.limit.mockResolvedValueOnce([])
      // username check
      mockDb.limit.mockResolvedValueOnce([])
      mockDb.returning.mockResolvedValueOnce([{
        id: '1',
        username: 'whiskers',
        email: 'whiskers@meowter.app',
        displayName: 'whiskers',
        avatarUrl: null
      }])

      const result = await service.register({
        username: 'whiskers',
        email: 'whiskers@meowter.app',
        password: 'MyStr0ngP@ss'
      })

      expect(result.user.username).toBe('whiskers')
      expect(result.accessToken).toBe('mock-access-token')
      expect(result.refreshToken).toBeDefined()
      expect(mockRedis.set).toHaveBeenCalled()
    })

    it('бросает AppException если email занят', async () => {
      mockDb.limit.mockResolvedValueOnce([{ id: '1' }])

      await expect(
        service.register({
          username: 'whiskers',
          email: 'whiskers@meowter.app',
          password: 'MyStr0ngP@ss'
        })
      ).rejects.toThrow(AppException)
    })

    it('бросает AppException если username занят', async () => {
      mockDb.limit.mockResolvedValueOnce([]) // email свободен
      mockDb.limit.mockResolvedValueOnce([{ id: '1' }]) // username занят

      await expect(
        service.register({
          username: 'whiskers',
          email: 'new@meowter.app',
          password: 'MyStr0ngP@ss'
        })
      ).rejects.toThrow(AppException)
    })
  })

  describe('login', () => {
    it('возвращает токены при верных данных', async () => {
      mockDb.limit.mockResolvedValueOnce([{
        id: '1',
        username: 'whiskers',
        email: 'whiskers@meowter.app',
        displayName: 'whiskers',
        avatarUrl: null,
        passwordHash: 'hashed-password'
      }])
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never)

      const result = await service.login({
        email: 'whiskers@meowter.app',
        password: 'MyStr0ngP@ss'
      })

      expect(result.user.username).toBe('whiskers')
      expect(result.accessToken).toBe('mock-access-token')
    })

    it('бросает AppException при неверной почте', async () => {
      mockDb.limit.mockResolvedValueOnce([])

      await expect(
        service.login({ email: 'wrong@meowter.app', password: 'pass' })
      ).rejects.toThrow(AppException)
    })

    it('бросает AppException при неверном пароле', async () => {
      mockDb.limit.mockResolvedValueOnce([{
        id: '1',
        username: 'whiskers',
        email: 'whiskers@meowter.app',
        passwordHash: 'hashed-password'
      }])
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never)

      await expect(
        service.login({ email: 'whiskers@meowter.app', password: 'wrong' })
      ).rejects.toThrow(AppException)
    })
  })

  describe('refresh', () => {
    it('выдает новые токены по валидному refresh token', async () => {
      mockRedis.get.mockResolvedValueOnce('user-id-1')
      mockDb.limit.mockResolvedValueOnce([{
        id: 'user-id-1',
        username: 'whiskers',
        email: 'whiskers@meowter.app',
        displayName: 'whiskers',
        avatarUrl: null
      }])

      const result = await service.refresh('valid-refresh-token')

      expect(result.accessToken).toBe('mock-access-token')
      expect(mockRedis.del).toHaveBeenCalledWith('refresh:valid-refresh-token')
    })

    it('бросает AppException при невалидном refresh token', async () => {
      mockRedis.get.mockResolvedValueOnce(null)

      await expect(service.refresh('invalid-token')).rejects.toThrow(AppException)
    })
  })

  describe('logout', () => {
    it('удаляет refresh token из Redis', async () => {
      await service.logout('some-refresh-token')

      expect(mockRedis.del).toHaveBeenCalledWith('refresh:some-refresh-token')
    })
  })

  describe('me', () => {
    it('возвращает профиль пользователя', async () => {
      mockDb.limit.mockResolvedValueOnce([{
        id: '1',
        username: 'whiskers',
        email: 'whiskers@meowter.app',
        displayName: 'whiskers',
        bio: null,
        avatarUrl: null,
        createdAt: new Date()
      }])

      const result = await service.me({ sub: '1', username: 'whiskers' })

      expect(result.username).toBe('whiskers')
    })

    it('бросает AppException если пользователь не найден', async () => {
      mockDb.limit.mockResolvedValueOnce([])

      await expect(
        service.me({ sub: 'non-existent', username: 'ghost' })
      ).rejects.toThrow(AppException)
    })
  })
})
