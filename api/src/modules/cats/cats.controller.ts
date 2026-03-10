import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { CurrentUser, type JwtPayload } from '../../common/decorators'
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards'

import { CatsService } from './cats.service'

const MAX_LIMIT = 100

@ApiTags('Cats')
@Controller('cats')
export class CatsController {
  constructor(private readonly cats: CatsService) {}

  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Профиль пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getProfile(
    @Param('username') username: string,
    @CurrentUser() user: JwtPayload | null
  ) {
    return this.cats.getProfile(username, user?.sub)
  }

  @Get(':username/meows')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Мяуты пользователя' })
  @ApiResponse({ status: 200, description: 'Список мяутов' })
  async getUserMeows(
    @Param('username') username: string,
    @CurrentUser() user: JwtPayload | null,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ) {
    const parsedLimit = limit ? Math.min(parseInt(limit, 10) || 20, MAX_LIMIT) : 20

    return this.cats.getUserMeows(
      username,
      user?.sub,
      cursor,
      parsedLimit
    )
  }

  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Подписаться' })
  @ApiResponse({ status: 200, description: 'Подписка оформлена' })
  async follow(
    @Param('username') username: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.cats.follow(user.sub, username)
  }

  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Отписаться' })
  @ApiResponse({ status: 200, description: 'Подписка отменена' })
  async unfollow(
    @Param('username') username: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.cats.unfollow(user.sub, username)
  }
}
