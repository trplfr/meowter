import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes
} from '@nestjs/swagger'
import type { FastifyRequest } from 'fastify'
import { join, extname } from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { randomUUID } from 'crypto'

import { ErrorCode } from '@shared/types'

import { CurrentUser, type JwtPayload } from '../../common/decorators'
import { AppException } from '../../common/exceptions'
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards'

import { MeowsService } from './meows.service'
import { CreateMeowDto, CreateCommentDto } from './dto'

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'meows')
const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

@ApiTags('Meows')
@Controller('meows')
export class MeowsController {
  constructor(private readonly meows: MeowsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Создать мяут' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Мяут создан' })
  async create(@Req() req: FastifyRequest, @CurrentUser() user: JwtPayload) {
    const parts = req.parts({ limits: { fileSize: MAX_SIZE } })

    let content = ''
    let imageUrl: string | null = null
    let replyToId: string | undefined

    for await (const part of parts) {
      if (part.type === 'field' && part.fieldname === 'content') {
        content = part.value as string
      }

      if (part.type === 'field' && part.fieldname === 'replyToId') {
        const val = part.value as string
        if (val) {
          replyToId = val
        }
      }

      if (part.type === 'file' && part.fieldname === 'image') {
        if (!ALLOWED_MIMES.includes(part.mimetype)) {
          throw new AppException(
            ErrorCode.FILE_INVALID_TYPE,
            400,
            'Only PNG, JPEG, WebP and GIF allowed'
          )
        }

        const buffer = await part.toBuffer()

        if (buffer.length > MAX_SIZE) {
          throw new AppException(
            ErrorCode.FILE_TOO_LARGE,
            400,
            'File too large (max 10MB)'
          )
        }

        const ext = extname(part.filename) || '.jpg'
        const filename = `${randomUUID()}${ext}`

        await mkdir(UPLOAD_DIR, { recursive: true })
        await writeFile(join(UPLOAD_DIR, filename), buffer)

        imageUrl = `/uploads/meows/${filename}`
      }
    }

    if (!content.trim()) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        400,
        'Content is required'
      )
    }

    const dto = new CreateMeowDto()
    dto.content = content

    return this.meows.create(user.sub, dto, imageUrl, replyToId)
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Лента мяутов' })
  @ApiResponse({ status: 200, description: 'Список мяутов' })
  async feed(
    @CurrentUser() user: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('tag') tag?: string,
    @Query('sort') sort?: string
  ) {
    return this.meows.getFeed(
      user.sub,
      cursor,
      limit ? parseInt(limit, 10) : 20,
      tag,
      sort === 'popular' ? 'popular' : 'date'
    )
  }

  @Get('tags')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Теги пользователя' })
  @ApiResponse({ status: 200, description: 'Список уникальных тегов' })
  async getUserTags(@CurrentUser() user: JwtPayload) {
    return this.meows.getUserTags(user.sub)
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Получить мяут' })
  @ApiResponse({ status: 200, description: 'Мяут' })
  @ApiResponse({ status: 404, description: 'Мяут не найден' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload | null
  ) {
    return this.meows.findById(id, user?.sub)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Удалить мяут' })
  @ApiResponse({ status: 200, description: 'Удалено' })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.meows.delete(id, user.sub)
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Лайкнуть мяут' })
  @ApiResponse({ status: 200, description: 'Лайк поставлен' })
  async like(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.meows.like(id, user.sub)
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Убрать лайк' })
  @ApiResponse({ status: 200, description: 'Лайк убран' })
  async unlike(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.meows.unlike(id, user.sub)
  }

  @Post(':id/remeow')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Ремяутнуть' })
  @ApiResponse({ status: 201, description: 'Ремяут создан' })
  async remeow(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.meows.remeow(id, user.sub)
  }

  @Delete(':id/remeow')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Убрать ремяут' })
  @ApiResponse({ status: 200, description: 'Ремяут убран' })
  async undoRemeow(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.meows.undoRemeow(id, user.sub)
  }

  @Get(':id/comments')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Комментарии к мяуту' })
  @ApiResponse({ status: 200, description: 'Список комментариев' })
  async getComments(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload | null,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ) {
    return this.meows.getComments(
      id,
      user?.sub,
      cursor,
      limit ? parseInt(limit, 10) : 20
    )
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Комментировать мяут' })
  @ApiResponse({ status: 201, description: 'Комментарий создан' })
  async createComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.meows.createComment(id, user.sub, dto)
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Удалить комментарий' })
  @ApiResponse({ status: 200, description: 'Удалено' })
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.meows.deleteComment(commentId, user.sub)
  }

  @Post('comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Лайкнуть комментарий' })
  @ApiResponse({ status: 200, description: 'Лайк поставлен' })
  async likeComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.meows.likeComment(commentId, user.sub)
  }

  @Delete('comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Убрать лайк с комментария' })
  @ApiResponse({ status: 200, description: 'Лайк убран' })
  async unlikeComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.meows.unlikeComment(commentId, user.sub)
  }
}
