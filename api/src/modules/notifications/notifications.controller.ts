import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { CurrentUser, type JwtPayload } from '../../common/decorators'
import { JwtAuthGuard } from '../../common/guards'

import { NotificationsService } from './notifications.service'

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Список уведомлений' })
  @ApiResponse({ status: 200, description: 'Уведомления' })
  async getList(
    @CurrentUser() user: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ) {
    return this.notifications.getList(user.sub, cursor, limit ? parseInt(limit, 10) : 20)
  }

  @Get('unread')
  @ApiOperation({ summary: 'Количество непрочитанных' })
  @ApiResponse({ status: 200, description: 'Счетчик' })
  async getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.notifications.getUnreadCount(user.sub)
  }

  @Post('read')
  @ApiOperation({ summary: 'Пометить все как прочитанные' })
  @ApiResponse({ status: 200, description: 'Отмечено' })
  async markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notifications.markAllRead(user.sub)
  }
}
