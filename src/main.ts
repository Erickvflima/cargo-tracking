import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { envSchema } from './utils/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose', 'warn', 'error', 'fatal'],
  });

  const env = envSchema.parse(process.env);

  app.enableCors();

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API RESTful Cargo Tracking')
    .setDescription(
      'Technical documentation for consuming the cargo tracking API',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(env.PORT);

  Logger.verbose(`The application is running on the port:${env.PORT}`);
}

bootstrap();
