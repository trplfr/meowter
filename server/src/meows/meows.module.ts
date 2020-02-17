import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MeowsController } from './meows.controller'
import { MeowsService } from './meows.service'
import { MeowRepository } from './meow.repository'

@Module({
  imports: [TypeOrmModule.forFeature([MeowRepository])],
  controllers: [MeowsController],
  providers: [MeowsService]
})
export class MeowsModule {}
