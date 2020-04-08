import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'

import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('Main')
  const app = await NestFactory.create(AppModule, { cors: true })

  app.setGlobalPrefix(`api/${process.env.API_VERSION}`)

  await app.listen(process.env.PORT)

  logger.log(`Application listening on ${process.env.PORT}`)
}

bootstrap()
