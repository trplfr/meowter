import { Module } from '@nestjs/common'
import { MeowsModule } from './meows/meows.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './config/typeorm.config'

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), MeowsModule]
})
export class AppModule {}
