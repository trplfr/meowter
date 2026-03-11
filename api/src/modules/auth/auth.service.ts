import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { eq, sql } from 'drizzle-orm'
import * as bcrypt from 'bcrypt'
import type Redis from 'ioredis'
import { randomUUID } from 'crypto'

import { ErrorCode } from '@shared/types'

import { DB, type Db } from '../../db/db.module'
import { REDIS } from '../../db/redis.module'
import { cats, follows } from '../../db/schema'
import { AppException } from '../../common/exceptions'
import { auditLog } from '../../common/lib'
import type { JwtPayload } from '../../common/decorators'

import { EmailService } from '../email'

import type {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto
} from './dto'

@Injectable()
export class AuthService {
  private readonly VERIFY_TTL = 24 * 60 * 60 // 24 часа
  private readonly REVERIFY_COOLDOWN = 15 * 60 // 15 минут

  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(REDIS) private readonly redis: Redis,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService
  ) {}

  async register(dto: RegisterDto, origin: string) {
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
      throw new AppException(
        ErrorCode.USERNAME_TAKEN,
        409,
        'Username already taken'
      )
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
        avatarUrl: cats.avatarUrl,
        emailVerified: cats.emailVerified,
        verified: cats.verified
      })

    auditLog('register', user.id, { username: dto.username, email: dto.email })

    await this.sendVerificationEmail(user.id, dto.email, origin)

    return this.issueTokens(user)
  }

  async login(dto: LoginDto) {
    const [user] = await this.db
      .select()
      .from(cats)
      .where(eq(cats.email, dto.email))
      .limit(1)

    if (!user) {
      throw new AppException(
        ErrorCode.INVALID_CREDENTIALS,
        401,
        'Invalid credentials'
      )
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash)

    if (!valid) {
      throw new AppException(
        ErrorCode.INVALID_CREDENTIALS,
        401,
        'Invalid credentials'
      )
    }

    auditLog('login', user.id, { email: dto.email })

    return this.issueTokens({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      verified: user.verified
    })
  }

  async refresh(refreshToken: string) {
    const userId = await this.redis.get(`refresh:${refreshToken}`)

    if (!userId) {
      throw new AppException(
        ErrorCode.REFRESH_TOKEN_INVALID,
        401,
        'Refresh token invalid'
      )
    }

    await this.redis.del(`refresh:${refreshToken}`)

    const [user] = await this.db
      .select({
        id: cats.id,
        username: cats.username,
        email: cats.email,
        displayName: cats.displayName,
        avatarUrl: cats.avatarUrl,
        emailVerified: cats.emailVerified,
        verified: cats.verified
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
        emailVerified: cats.emailVerified,
        verified: cats.verified,
        createdAt: cats.createdAt
      })
      .from(cats)
      .where(eq(cats.id, payload.sub))
      .limit(1)

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 404, 'User not found')
    }

    const [[{ count: followingCount }], [{ count: followersCount }]] =
      await Promise.all([
        this.db
          .select({ count: sql<number>`count(*)::int` })
          .from(follows)
          .where(eq(follows.followerId, user.id)),
        this.db
          .select({ count: sql<number>`count(*)::int` })
          .from(follows)
          .where(eq(follows.followingId, user.id))
      ])

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
    const displayName =
      dto.displayName !== undefined
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
        emailVerified: cats.emailVerified,
        verified: cats.verified,
        createdAt: cats.createdAt
      })

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 404, 'User not found')
    }

    const [[{ count: followingCount }], [{ count: followersCount }]] =
      await Promise.all([
        this.db
          .select({ count: sql<number>`count(*)::int` })
          .from(follows)
          .where(eq(follows.followerId, user.id)),
        this.db
          .select({ count: sql<number>`count(*)::int` })
          .from(follows)
          .where(eq(follows.followingId, user.id))
      ])

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
      throw new AppException(
        ErrorCode.WRONG_PASSWORD,
        401,
        'Old password is incorrect'
      )
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10)

    await this.db
      .update(cats)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(cats.id, userId))

    auditLog('password_change', userId)

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

  async verifyEmail(token: string) {
    const userId = await this.redis.get(`verify:${token}`)

    if (!userId) {
      throw new AppException(
        ErrorCode.VERIFICATION_TOKEN_INVALID,
        400,
        'Verification token is invalid or expired'
      )
    }

    await this.redis.del(`verify:${token}`)

    await this.db
      .update(cats)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(cats.id, userId))

    auditLog('email_verified', userId)

    return { ok: true }
  }

  async reverify(payload: JwtPayload, origin: string) {
    const [user] = await this.db
      .select({
        id: cats.id,
        email: cats.email,
        emailVerified: cats.emailVerified
      })
      .from(cats)
      .where(eq(cats.id, payload.sub))
      .limit(1)

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 404, 'User not found')
    }

    if (user.emailVerified) {
      return { ok: true, retryAfter: 0 }
    }

    // cooldown: 1 письмо в 15 минут
    const cooldownKey = `reverify_cooldown:${user.id}`
    const ttl = await this.redis.ttl(cooldownKey)

    if (ttl > 0) {
      return { ok: false, retryAfter: ttl }
    }

    await this.sendVerificationEmail(user.id, user.email, origin)
    await this.redis.set(cooldownKey, '1', 'EX', this.REVERIFY_COOLDOWN)

    return { ok: true, retryAfter: this.REVERIFY_COOLDOWN }
  }

  private async sendVerificationEmail(
    userId: string,
    userEmail: string,
    origin: string
  ) {
    const token = randomUUID()

    await this.redis.set(`verify:${token}`, userId, 'EX', this.VERIFY_TTL)

    try {
      await this.email.sendVerificationEmail(userEmail, token, origin)
    } catch (err) {
      auditLog('verification_email_failed', userId, { error: String(err) })
    }
  }

  private async issueTokens(user: {
    id: string
    username: string
    email: string
    displayName: string
    avatarUrl: string | null
    emailVerified: boolean
    verified: boolean
  }) {
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
