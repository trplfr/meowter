import { Module, forwardRef } from '@nestjs/common'

import { NotificationsModule } from '../notifications/notifications.module'

import { MeowsController } from './meows.controller'
import { MeowsService } from './meows.service'

@Module({
  imports: [forwardRef(() => NotificationsModule)],
  controllers: [MeowsController],
  providers: [MeowsService],
  exports: [MeowsService]
})
export class MeowsModule {}
