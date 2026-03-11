import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
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
import { eq } from 'drizzle-orm'
import { join } from 'path'

import { ErrorCode } from '@shared/types'

import { DB, type Db } from '../../db/db.module'
import { cats } from '../../db/schema'

import { CurrentUser, type JwtPayload } from '../../common/decorators'
import { AppException } from '../../common/exceptions'
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards'
import { stripHtml, saveUpload } from '../../common/lib'

import { MeowsService } from './meows.service'
import { CreateMeowDto, CreateCommentDto } from './dto'

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'meows')
const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_LIMIT = 100

@ApiTags('Meows')
@Controller('meows')
export class MeowsController {
  constructor(
    private readonly meows: MeowsService,
    @Inject(DB) private readonly db: Db
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Создать мяут' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Мяут создан' })
  async create(@Req() req: FastifyRequest, @CurrentUser() user: JwtPayload) {
    await this.ensureEmailVerified(user.sub)

    const parts = req.parts({ limits: { fileSize: MAX_SIZE } })

    let content = ''
    let imageUrl: string | null = null
    let replyToId: string | undefined

    for await (const part of parts) {
      if (part.type === 'field' && part.fieldname === 'content') {
        content = stripHtml(part.value as string)
      }

      if (part.type === 'field' && part.fieldname === 'replyToId') {
        const val = part.value as string
        if (val) {
          replyToId = val
        }
      }

      if (part.type === 'file' && part.fieldname === 'image') {
        const buffer = await part.toBuffer()

        imageUrl = await saveUpload({
          buffer,
          mimetype: part.mimetype,
          filename: part.filename,
          dir: UPLOAD_DIR,
          allowedMimes: ALLOWED_MIMES,
          maxSize: MAX_SIZE,
          urlPrefix: '/uploads/meows/'
        })
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
    const parsedLimit = limit ? Math.min(parseInt(limit, 10) || 20, MAX_LIMIT) : 20

    return this.meows.getFeed(
      user.sub,
      cursor,
      parsedLimit,
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
    await this.ensureEmailVerified(user.sub)
    return this.meows.like(id, user.sub)
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Убрать лайк' })
  @ApiResponse({ status: 200, description: 'Лайк убран' })
  async unlike(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.ensureEmailVerified(user.sub)
    return this.meows.unlike(id, user.sub)
  }

  @Post(':id/remeow')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Ремяутнуть' })
  @ApiResponse({ status: 201, description: 'Ремяут создан' })
  async remeow(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.ensureEmailVerified(user.sub)
    return this.meows.remeow(id, user.sub)
  }

  @Delete(':id/remeow')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Убрать ремяут' })
  @ApiResponse({ status: 200, description: 'Ремяут убран' })
  async undoRemeow(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.ensureEmailVerified(user.sub)
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
    const parsedLimit = limit ? Math.min(parseInt(limit, 10) || 20, MAX_LIMIT) : 20

    return this.meows.getComments(
      id,
      user?.sub,
      cursor,
      parsedLimit
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
    await this.ensureEmailVerified(user.sub)
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
    await this.ensureEmailVerified(user.sub)
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
    await this.ensureEmailVerified(user.sub)
    return this.meows.unlikeComment(commentId, user.sub)
  }

  private async ensureEmailVerified(userId: string) {
    const [cat] = await this.db
      .select({ emailVerified: cats.emailVerified })
      .from(cats)
      .where(eq(cats.id, userId))
      .limit(1)

    if (!cat?.emailVerified) {
      throw new AppException(
        ErrorCode.EMAIL_NOT_VERIFIED,
        403,
        'Email not verified'
      )
    }
  }
}
