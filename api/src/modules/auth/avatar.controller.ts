import { Controller, Post, Req, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes
} from '@nestjs/swagger'
import type { FastifyRequest } from 'fastify'
import { join } from 'path'

import { ErrorCode } from '@shared/types'

import { CurrentUser, type JwtPayload } from '../../common/decorators'
import { AppException } from '../../common/exceptions'
import { JwtAuthGuard } from '../../common/guards'
import { saveUpload } from '../../common/lib'

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
      throw new AppException(
        ErrorCode.FILE_NOT_PROVIDED,
        400,
        'File not provided'
      )
    }

    const buffer = await file.toBuffer()

    const avatarUrl = await saveUpload({
      buffer,
      mimetype: file.mimetype,
      filename: file.filename,
      dir: UPLOAD_DIR,
      allowedMimes: ALLOWED_MIMES,
      maxSize: MAX_SIZE,
      urlPrefix: '/uploads/avatars/'
    })

    return this.auth.updateAvatar(user.sub, avatarUrl)
  }
}
