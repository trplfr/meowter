import { Global, Inject, Module, type OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

export const DB = Symbol('DB')
export const DB_POOL = Symbol('DB_POOL')
export type Db = NodePgDatabase<typeof schema>

@Global()
@Module({
  providers: [
    {
      provide: DB_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const pool = new Pool({
          connectionString: config.getOrThrow('DATABASE_URL'),
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000
        })

        pool.on('error', (err) => {
          console.error('Unexpected PG pool error:', err.message)
        })

        return pool
      }
    },
    {
      provide: DB,
      inject: [DB_POOL],
      useFactory: (pool: Pool) => {
        return drizzle(pool, { schema })
      }
    }
  ],
  exports: [DB, DB_POOL]
})
export class DbModule implements OnModuleDestroy {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async onModuleDestroy() {
    await this.pool.end()
  }
}
