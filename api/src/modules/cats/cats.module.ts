import { Module } from '@nestjs/common'

import { NotificationsModule } from '../notifications/notifications.module'

import { CatsController } from './cats.controller'
import { CatsService } from './cats.service'

@Module({
  imports: [NotificationsModule],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
export class CatsModule {}
