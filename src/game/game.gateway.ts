import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameMatchService } from './services/gamematch.service';

// enum RoomType {
//   PUBLIC = 'public',
//   PRIVATE = 'p',
// }

@WebSocketGateway({ namespace: 'game' })
export class GameGateway {
  constructor(private gameMatchService: GameMatchService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('game:create-match-room')
  async createMatchHandler(
    @MessageBody('playerUsername') playerUsername: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const gameMatch = await this.gameMatchService.createMatch(playerUsername);
      client.join('match-' + gameMatch.id);
      return {
        status: 'ok',
        data: {
          gameMatch: {
            id: gameMatch.id,
          },
          message: 'Game match room crceated',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        data: { message: error.message },
      };
    }
  }

  @SubscribeMessage('game:join-match-room')
  async joinMatchRoom(
    @MessageBody('gameMatchId') gameMatchId: string,
    @MessageBody('playerUsername') playerUsername: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.gameMatchService.addUserToMatchRoom(
        playerUsername,
        gameMatchId,
      );
      client.join('match-' + gameMatchId);
      this.notifyGameMatchRoom(gameMatchId, {
        status: 'ok',
        message: 'User ' + playerUsername + ' join to room',
      });
      this.reportRoomMatchInfo(gameMatchId);
      return { status: 'ok' };
    } catch (error) {
      this.notifyGameMatchRoom(gameMatchId, {
        status: 'error',
        message: 'User cannot join to room because ' + error.message,
      });
      return { status: 'error' };
    }
  }
  private async reportRoomMatchInfo(roomMatchId: string) {
    const gameMatch = await this.gameMatchService.getGameMatch(roomMatchId);
    this.server
      .to('match-' + roomMatchId)
      .emit('game:room-info-updated', { data: { ...gameMatch?.info } });
  }
  private notifyGameMatchRoom(
    gameMatchId: string,
    { status, message }: { status: string; message: string },
  ) {
    this.server
      .to('match-' + gameMatchId)
      .emit('game:room-match-notifications', { status, data: { message } });
  }
}
