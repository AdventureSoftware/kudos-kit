import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded, type NextFunction, type Request, type Response } from 'express';
import { AppModule } from './app.module';

/** Largest request body accepted outside /api/auth (feedback with console logs fits easily). */
const BODY_LIMIT = '256kb';

async function bootstrap() {
  // Better Auth reads the raw body of /api/auth itself, so Nest's parser is off...
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // ...and re-added here, with an explicit size limit, for every other route.
  const jsonParser = json({ limit: BODY_LIMIT });
  const formParser = urlencoded({ extended: true, limit: BODY_LIMIT });
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/auth')) return next();
    jsonParser(req, res, (err?: unknown) => (err ? next(err) : formParser(req, res, next)));
  });

  // The widget posts from any site. The dashboard reaches /api/auth on its own origin.
  app.enableCors({ methods: ['POST'], origin: '*' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
