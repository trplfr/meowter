import { Module } from '@nestjs/common'
import { MeowsModule } from './meows/meows.module'

@Module({
  imports: [MeowsModule]
})
export class AppModule {}
