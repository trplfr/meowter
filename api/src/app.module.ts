import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { DbModule } from './db/db.module'
import { RedisModule } from './db/redis.module'
import { AuthModule } from './modules/auth/auth.module'
import { MeowsModule } from './modules/meows/meows.module'
import { CatsModule } from './modules/cats/cats.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    RedisModule,
    AuthModule,
    MeowsModule,
    CatsModule,
    NotificationsModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
