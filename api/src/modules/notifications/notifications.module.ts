import { Module, forwardRef } from '@nestjs/common'

import { MeowsModule } from '../meows/meows.module'

import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'

@Module({
  imports: [forwardRef(() => MeowsModule)],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
