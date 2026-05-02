import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class UiController {
  @Get('/')
  index(@Res() res: Response) {
    res.render('index', {
      title: 'Rock Paper Scissors',
    });
  }

  @Get('/game')
  game(@Res() res: Response) {
    res.render('game', {
      title: 'Game Room',
    });
  }
}
