import { Controller, Post, Req, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger'
import type { FastifyRequest } from 'fastify'
import { join, extname } from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { randomUUID } from 'crypto'

import { ErrorCode } from '@shared/types'

import { CurrentUser, type JwtPayload } from '../../common/decorators'
import { AppException } from '../../common/exceptions'
import { JwtAuthGuard } from '../../common/guards'

import { AuthService } from './auth.service'

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars')
const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

@ApiTags('Auth')
@Controller('auth')
export class AvatarController {
  constructor(private readonly auth: AuthService) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Загрузка аватара' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Аватар загружен' })
  @ApiResponse({ status: 400, description: 'Неверный формат файла' })
  async upload(@Req() req: FastifyRequest, @CurrentUser() user: JwtPayload) {
    const file = await req.file({ limits: { fileSize: MAX_SIZE } })

    if (!file) {
      throw new AppException(ErrorCode.FILE_NOT_PROVIDED, 400, 'File not provided')
    }

    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new AppException(ErrorCode.FILE_INVALID_TYPE, 400, 'Only PNG, JPEG and WebP allowed')
    }

    const buffer = await file.toBuffer()

    if (buffer.length > MAX_SIZE) {
      throw new AppException(ErrorCode.FILE_TOO_LARGE, 400, 'File too large (max 5MB)')
    }

    const ext = extname(file.filename) || '.jpg'
    const filename = `${randomUUID()}${ext}`

    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(join(UPLOAD_DIR, filename), buffer)

    const avatarUrl = `/uploads/avatars/${filename}`
    return this.auth.updateAvatar(user.sub, avatarUrl)
  }
}
