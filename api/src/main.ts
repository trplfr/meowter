import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  type NestFastifyApplication
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import fastifyCookie from '@fastify/cookie'
import fastifyMultipart from '@fastify/multipart'
import { join } from 'path'

import { AppModule } from './app.module'
import { AppExceptionFilter } from './common/filters'

const bootstrap = async () => {
  const isProd = process.env.NODE_ENV === 'production'

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: isProd
        ? { level: 'warn' }
        : true,
      trustProxy: isProd,
      bodyLimit: 15 * 1024 * 1024
    })
  )

  app.enableShutdownHooks()

  await app.register(fastifyCookie)
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1
    }
  })

  app.useStaticAssets({
    root: join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    maxAge: isProd ? 86400000 : 0
  })

  app.enableCors({
    origin: isProd
      ? [
          'https://meowter.app',
          'https://meowter.ru',
          'https://dev.meowter.app',
          'https://dev.meowter.ru'
        ]
      : ['http://localhost:3000'],
    credentials: true
  })

  app.setGlobalPrefix('api')

  app.useGlobalFilters(new AppExceptionFilter())

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )

  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('Meowter API')
      .setVersion('1.0')
      .build()
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(app, config)
    )
  }

  const port = parseInt(process.env.PORT || '4000', 10)
  await app.listen(port, '0.0.0.0')
  console.log(`Meowter API running on :${port}`)
}

bootstrap()
