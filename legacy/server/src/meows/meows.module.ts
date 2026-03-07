import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MeowsController } from './meows.controller'
import { MeowsService } from './meows.service'
import { MeowRepository } from './meow.repository'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [TypeOrmModule.forFeature([MeowRepository]), AuthModule],
  controllers: [MeowsController],
  providers: [MeowsService]
})
export class MeowsModule {}
