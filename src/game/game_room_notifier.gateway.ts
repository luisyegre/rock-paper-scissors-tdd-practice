import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameMatchService } from './services/gamematch.service';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'game' })
export class GameRoomNotifier {
  constructor(private gameMatchService: GameMatchService) {}
  @WebSocketServer()
  server: Server;
  async reportRoomMatchInfo(roomMatchId: string) {
    const gameMatch = await this.gameMatchService.getGameMatch(roomMatchId);
    this.server
      .to('match-' + roomMatchId)
      .emit('game:room-info-updated', { data: { ...gameMatch?.info } });
  }
  notifyGameMatchRoom(
    gameMatchId: string,
    { status, message, data }: { status: string; message: string; data?: any },
  ) {
    this.server
      .to('match-' + gameMatchId)
      .emit('game:room-match-notifications', {
        status,
        data: { message, ...data },
      });
  }
}
