import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { eq, or, sql } from 'drizzle-orm'
import * as bcrypt from 'bcrypt'
import type Redis from 'ioredis'
import { randomUUID } from 'crypto'

import { ErrorCode } from '@shared/types'

import { DB, type Db } from '../../db/db.module'
import { REDIS } from '../../db/redis.module'
import { cats, follows } from '../../db/schema'
import { AppException } from '../../common/exceptions'
import type { JwtPayload } from '../../common/decorators'

import type { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from './dto'

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(REDIS) private readonly redis: Redis,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const [byEmail] = await this.db
      .select({ id: cats.id })
      .from(cats)
      .where(eq(cats.email, dto.email))
      .limit(1)

    if (byEmail) {
      throw new AppException(ErrorCode.EMAIL_TAKEN, 409, 'Email already taken')
    }

    const [byUsername] = await this.db
      .select({ id: cats.id })
      .from(cats)
      .where(eq(cats.username, dto.username))
      .limit(1)

    if (byUsername) {
      throw new AppException(ErrorCode.USERNAME_TAKEN, 409, 'Username already taken')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)

    const [user] = await this.db
      .insert(cats)
      .values({
        username: dto.username,
        email: dto.email,
        passwordHash,
        displayName: dto.username
      })
      .returning({
        id: cats.id,
        username: cats.username,
        email: cats.email,
        displayName: cats.displayName,
        avatarUrl: cats.avatarUrl
      })

    return this.issueTokens(user)
  }

  async login(dto: LoginDto) {
    const [user] = await this.db
      .select()
      .from(cats)
      .where(eq(cats.email, dto.email))
      .limit(1)

    if (!user) {
      throw new AppException(ErrorCode.INVALID_CREDENTIALS, 401, 'Invalid credentials')
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash)

    if (!valid) {
      throw new AppException(ErrorCode.INVALID_CREDENTIALS, 401, 'Invalid credentials')
    }

    return this.issueTokens({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    })
  }

  async refresh(refreshToken: string) {
    const userId = await this.redis.get(`refresh:${refreshToken}`)

    if (!userId) {
      throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID, 401, 'Refresh token invalid')
    }

    await this.redis.del(`refresh:${refreshToken}`)

    const [user] = await this.db
      .select({
        id: cats.id,
        username: cats.username,
        email: cats.email,
        displayName: cats.displayName,
        avatarUrl: cats.avatarUrl
      })
      .from(cats)
      .where(eq(cats.id, userId))
      .limit(1)

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 404, 'User not found')
    }

    return this.issueTokens(user)
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      await this.redis.del(`refresh:${refreshToken}`)
    }
  }

  async me(payload: JwtPayload) {
    const [user] = await this.db
      .select({
        id: cats.id,
        username: cats.username,
        email: cats.email,
        displayName: cats.displayName,
        firstName: cats.firstName,
        lastName: cats.lastName,
        bio: cats.bio,
        contacts: cats.contacts,
        sex: cats.sex,
        avatarUrl: cats.avatarUrl,
        createdAt: cats.createdAt
      })
      .from(cats)
      .where(eq(cats.id, payload.sub))
      .limit(1)

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 404, 'User not found')
    }

    const [{ count: followingCount }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followerId, user.id))

    const [{ count: followersCount }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followingId, user.id))

    return {
      ...user,
      followingCount,
      followersCount,
      isFollowing: false,
      isOwn: true
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // если displayName задан явно = используем его, иначе fallback на firstName + lastName
    const displayName = dto.displayName !== undefined
      ? dto.displayName
      : [dto.firstName, dto.lastName].filter(Boolean).join(' ') || undefined

    const [user] = await this.db
      .update(cats)
      .set({
        firstName: dto.firstName,
        lastName: dto.lastName,
        bio: dto.bio,
        contacts: dto.contacts,
        sex: dto.sex,
        ...(displayName ? { displayName } : {}),
        updatedAt: new Date()
      })
      .where(eq(cats.id, userId))
      .returning({
        id: cats.id,
        username: cats.username,
        email: cats.email,
        displayName: cats.displayName,
        firstName: cats.firstName,
        lastName: cats.lastName,
        bio: cats.bio,
        contacts: cats.contacts,
        sex: cats.sex,
        avatarUrl: cats.avatarUrl,
        createdAt: cats.createdAt
      })

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 404, 'User not found')
    }

    const [{ count: followingCount }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followerId, user.id))

    const [{ count: followersCount }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followingId, user.id))

    return {
      ...user,
      followingCount,
      followersCount,
      isFollowing: false,
      isOwn: true
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const [user] = await this.db
      .select({ passwordHash: cats.passwordHash })
      .from(cats)
      .where(eq(cats.id, userId))
      .limit(1)

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 404, 'User not found')
    }

    const valid = await bcrypt.compare(dto.oldPassword, user.passwordHash)

    if (!valid) {
      throw new AppException(ErrorCode.WRONG_PASSWORD, 401, 'Old password is incorrect')
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10)

    await this.db
      .update(cats)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(cats.id, userId))

    return { ok: true }
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const [user] = await this.db
      .update(cats)
      .set({ avatarUrl, updatedAt: new Date() })
      .where(eq(cats.id, userId))
      .returning({
        id: cats.id,
        avatarUrl: cats.avatarUrl
      })

    return user
  }

  private async issueTokens(user: { id: string; username: string; email: string; displayName: string; avatarUrl: string | null }) {
    const payload: JwtPayload = { sub: user.id, username: user.username }

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.getOrThrow('JWT_ACCESS_TTL')
    })

    const refreshToken = randomUUID()
    const refreshTtl = 30 * 24 * 60 * 60 // 30 дней

    await this.redis.set(`refresh:${refreshToken}`, user.id, 'EX', refreshTtl)

    return { accessToken, refreshToken, user }
  }
}
