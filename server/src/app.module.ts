import { Module } from '@nestjs/common'
import { MeowsModule } from './meows/meows.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './config/typeorm.config'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), MeowsModule, AuthModule]
})
export class AppModule {}
