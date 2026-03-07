import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { DbModule } from './db/db.module'
import { RedisModule } from './db/redis.module'
import { AuthModule } from './modules/auth/auth.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    RedisModule,
    AuthModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
