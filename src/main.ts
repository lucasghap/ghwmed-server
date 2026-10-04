import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { AppModule } from './app.module';

dotenv.config()

const PORT = process.env.PORT

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors()

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  })

  await app.listen(PORT);
}
bootstrap();
