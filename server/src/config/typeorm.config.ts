import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB,
  entities: ['dist/**/*.entity.js'],
  synchronize: true
}
