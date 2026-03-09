import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { CurrentUser, type JwtPayload } from '../../common/decorators'
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
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь создан' })
  @ApiResponse({ status: 409, description: 'Пользователь уже существует' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const { accessToken, refreshToken, user } = await this.auth.register(dto)

    this.setCookies(res, accessToken, refreshToken)

    return user
  }

  @Post('login')
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
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiResponse({ status: 200, description: 'Токены обновлены' })
  @ApiResponse({ status: 401, description: 'Невалидный refresh token' })
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const token = req.cookies?.refresh_token

    if (!token) {
      res.status(401)
      return { message: 'Refresh token отсутствует' }
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
  @ApiOperation({ summary: 'Смена пароля' })
  @ApiResponse({ status: 200, description: 'Пароль изменен' })
  @ApiResponse({ status: 401, description: 'Неверный старый пароль' })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.auth.changePassword(user.sub, dto)
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
