import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function swaggerSetup(app) {
  const config = new DocumentBuilder()
    .setTitle('ColiApp API')
    .setDescription('API de autenticación y gestión de ColiApp con Supabase')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticación')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT',
        in: 'header',
      },
      'JWT-auth', 
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  await swaggerSetup(app);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Servidor corriendo en: http://localhost:${process.env.PORT ?? 3000}`);
}

bootstrap();
