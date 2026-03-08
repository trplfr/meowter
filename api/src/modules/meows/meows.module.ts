import { Module } from '@nestjs/common'

import { NotificationsModule } from '../notifications/notifications.module'

import { MeowsController } from './meows.controller'
import { MeowsService } from './meows.service'

@Module({
  imports: [NotificationsModule],
  controllers: [MeowsController],
  providers: [MeowsService],
  exports: [MeowsService]
})
export class MeowsModule {}
