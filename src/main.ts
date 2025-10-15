import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
  console.log("servidor corriendo en:" + process.env.PORT);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );
}
bootstrap();
