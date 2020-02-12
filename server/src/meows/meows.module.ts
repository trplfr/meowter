import { Module } from '@nestjs/common'
import { MeowsController } from './meows.controller'
import { MeowsService } from './meows.service'

@Module({
  controllers: [MeowsController],
  providers: [MeowsService]
})
export class MeowsModule {}
