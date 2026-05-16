import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Base62Converter } from './common/utils/base62.converter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  console.log(Base62Converter.encode(125));

  console.log(Base62Converter.decode('21'));
}
bootstrap();
