import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'

import { typeOrmConfig } from './config/typeorm.config'
import { MeowsModule } from './meows/meows.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    MeowsModule,
    AuthModule
  ]
})
export class AppModule {}
