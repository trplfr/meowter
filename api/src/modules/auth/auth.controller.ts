import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { ErrorCode } from '@shared/types'

import { CurrentUser, type JwtPayload } from '../../common/decorators'
import { AppException } from '../../common/exceptions'
import { JwtAuthGuard } from '../../common/guards'

import { AuthService } from './auth.service'
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto
} from './dto'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь создан' })
  @ApiResponse({ status: 409, description: 'Пользователь уже существует' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const origin = this.getOrigin(req)
    const { accessToken, refreshToken, user } = await this.auth.register(
      dto,
      origin
    )

    this.setCookies(res, accessToken, refreshToken)

    return user
  }

  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: 'Вход в аккаунт' })
  @ApiResponse({ status: 200, description: 'Успешный вход' })
  @ApiResponse({ status: 401, description: 'Неверные данные' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const { accessToken, refreshToken, user } = await this.auth.login(dto)

    this.setCookies(res, accessToken, refreshToken)

    return user
  }

  @Post('refresh')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiResponse({ status: 200, description: 'Токены обновлены' })
  @ApiResponse({ status: 401, description: 'Невалидный refresh token' })
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const token = req.cookies?.refresh_token

    if (!token) {
      throw new AppException(
        ErrorCode.REFRESH_TOKEN_INVALID,
        401,
        'Refresh token missing'
      )
    }

    const { accessToken, refreshToken, user } = await this.auth.refresh(token)

    this.setCookies(res, accessToken, refreshToken)

    return user
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выход из аккаунта' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const token = req.cookies?.refresh_token

    if (token) {
      await this.auth.logout(token)
    }

    res.clearCookie('access_token', { path: '/' })
    res.clearCookie('refresh_token', { path: '/' })

    return { ok: true }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Текущий пользователь' })
  @ApiResponse({ status: 200, description: 'Профиль пользователя' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async me(@CurrentUser() user: JwtPayload) {
    return this.auth.me(user)
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Обновление профиля' })
  @ApiResponse({ status: 200, description: 'Профиль обновлен' })
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.auth.updateProfile(user.sub, dto)
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: 'Смена пароля' })
  @ApiResponse({ status: 200, description: 'Пароль изменен' })
  @ApiResponse({ status: 401, description: 'Неверный старый пароль' })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.auth.changePassword(user.sub, dto)
  }

  @Post('verify')
  @ApiOperation({ summary: 'Подтверждение email по токену' })
  @ApiResponse({ status: 200, description: 'Email подтвержден' })
  @ApiResponse({ status: 400, description: 'Невалидный токен' })
  async verify(@Body('token') token: string) {
    if (!token) {
      throw new AppException(
        ErrorCode.VERIFICATION_TOKEN_INVALID,
        400,
        'Token is required'
      )
    }

    await this.auth.verifyEmail(token)

    return { ok: true }
  }

  @Post('reverify')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: 'Повторная отправка письма верификации' })
  @ApiResponse({ status: 200, description: 'Письмо отправлено или cooldown' })
  async reverify(@CurrentUser() user: JwtPayload, @Req() req: FastifyRequest) {
    const origin = this.getOrigin(req)
    return this.auth.reverify(user, origin)
  }

  private getOrigin(req: FastifyRequest): string {
    const host = req.headers['x-forwarded-host'] || req.headers.host || ''
    const hostStr = Array.isArray(host) ? host[0] : host

    if (hostStr.includes('localhost')) {
      return process.env.WEB_ORIGIN || 'http://localhost:3000'
    }

    if (hostStr.includes('dev.meowter.ru')) {
      return 'https://dev.meowter.ru'
    }

    if (hostStr.includes('dev.meowter.app')) {
      return 'https://dev.meowter.app'
    }

    if (hostStr.includes('meowter.ru')) {
      return 'https://meowter.ru'
    }

    return 'https://meowter.app'
  }

  private setCookies(
    res: FastifyReply,
    accessToken: string,
    refreshToken: string
  ) {
    res.setCookie('access_token', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 // 15 минут
    })

    res.setCookie('refresh_token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60 // 30 дней
    })
  }
}
