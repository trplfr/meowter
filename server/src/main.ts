import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('Main')
  const app = await NestFactory.create(AppModule, { cors: true })

  app.setGlobalPrefix(`api/${process.env.API_VERSION}`)

  const options = new DocumentBuilder()
    .setTitle('meowter')
    .setDescription('The meowter API description')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, options, {
    ignoreGlobalPrefix: true
  })

  SwaggerModule.setup('api', app, document)

  await app.listen(process.env.PORT)

  logger.log(`Application listening on ${process.env.PORT}`)
}

bootstrap()
