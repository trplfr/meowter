import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'

import { MeowsModule } from './meows/meows.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { createTypeOrmOptions } from './ormconfig'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot(createTypeOrmOptions()),
    MeowsModule,
    UsersModule,
    AuthModule
  ]
})
export class AppModule {}
