import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { PlayerCreationService } from './services/PlayerCreation.service';

@Controller()
export class GameController {
  constructor(private readonly playerCreationService: PlayerCreationService) {}

  @Post('/register')
  registerPlayer(
    @Body()
    { username }: { username: string },
  ) {
    return this.playerCreationService.create(username);
  }
}
