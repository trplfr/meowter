import { Global, Inject, Module, type OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

export const REDIS = Symbol('REDIS')

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redis = new Redis(config.getOrThrow('REDIS_URL'), {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 10) {
              return null
            }
            return Math.min(times * 200, 5000)
          },
          enableReadyCheck: true,
          lazyConnect: false
        })

        redis.on('error', (err) => {
          console.error('Redis connection error:', err.message)
        })

        redis.on('connect', () => {
          console.log('Redis connected')
        })

        return redis
      }
    }
  ],
  exports: [REDIS]
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onModuleDestroy() {
    await this.redis.quit()
  }
}
