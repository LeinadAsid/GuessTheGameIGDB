import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        let deepness = 1;
        const getMessages = (e: ValidationError) => {
          let validationMessages = [];
          for (const property in e.constraints) {
            validationMessages.push(e.constraints[property]);
          }
          if (e.children.length > 0) {
            deepness++;
            validationMessages = [
              ...validationMessages,
              ...e.children.map((c) => getMessages(c)),
            ];
          }
          return validationMessages;
        };
        return new BadRequestException(
          validationErrors.map(getMessages).flat(deepness),
        );
      },
    }),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
