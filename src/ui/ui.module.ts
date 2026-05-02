import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UiController } from './ui.controller';
import { join } from 'path';

@Module({
  controllers: [UiController],
})
export class UiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: any, res: any, next: any) => {
        const expressStatic = require('express').static;
        const staticMiddleware = expressStatic(join(__dirname, 'public'));
        staticMiddleware(req, res, next);
      })
      .forRoutes('public');
  }
}
