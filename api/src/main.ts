import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'

import { AppModule } from './app.module'

const bootstrap = async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  )

  app.enableCors({
    origin: ['http://localhost:3000', 'https://meowter.app', 'https://meowter.ru'],
    credentials: true
  })

  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true
    })
  )

  const config = new DocumentBuilder()
    .setTitle('Meowter API')
    .setVersion('1.0')
    .build()
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config))

  await app.listen(4000, '0.0.0.0')
}

bootstrap()
