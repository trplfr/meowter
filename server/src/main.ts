import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  app.setGlobalPrefix('api/v1') // TODO: выввести это в .env
  await app.listen(5000)
}

bootstrap()
