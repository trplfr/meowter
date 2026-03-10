import { Module } from '@nestjs/common'

import { NotificationsModule } from '../notifications/notifications.module'
import { MeowsModule } from '../meows/meows.module'

import { CatsController } from './cats.controller'
import { CatsService } from './cats.service'

@Module({
  imports: [NotificationsModule, MeowsModule],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
export class CatsModule {}
