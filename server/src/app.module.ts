import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { MeowsModule } from './meows/meows.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: configService.get('DB_TYPE'),
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB'),
        entities: ['dist/**/*.entity.js'],
        synchronize: true
      })
    }),
    MeowsModule,
    UsersModule,
    AuthModule
  ]
})
export class AppModule {}
