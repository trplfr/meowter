import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { DbModule } from './db/db.module'
import { RedisModule } from './db/redis.module'
import { AuthModule } from './modules/auth/auth.module'
import { MeowsModule } from './modules/meows/meows.module'
import { CatsModule } from './modules/cats/cats.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { SitemapModule } from './modules/sitemap/sitemap.module'
import { TopicsModule } from './modules/topics/topics.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60_000,
      limit: 100
    }]),
    DbModule,
    RedisModule,
    AuthModule,
    MeowsModule,
    CatsModule,
    NotificationsModule,
    SitemapModule,
    TopicsModule
  ],
  controllers: [HealthController],
  providers: [{
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }]
})
export class AppModule {}
