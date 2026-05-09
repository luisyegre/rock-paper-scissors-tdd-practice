import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameMatchService } from './services/gamematch.service';
import { Choice } from './enums/choice.enum';
import { GameRoomNotifier } from './game_room_notifier.gateway';

// enum RoomType {
//   PUBLIC = 'public',
//   PRIVATE = 'p',
// }

@WebSocketGateway({ namespace: 'game' })
export class GameGateway {
  constructor(
    private gameMatchService: GameMatchService,
    private gameRoomNotifier: GameRoomNotifier,
  ) {}
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

  @SubscribeMessage('game:replay')
  async replay(
    @MessageBody('gameMatchId') gameMatchId: string,
    @MessageBody('playerUsername') playerUsername: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const gameMatch = await this.gameMatchService.getGameMatch(gameMatchId);
      if (!gameMatch) throw new Error('Match not found');
      gameMatch.reset();
      client.join('match-' + gameMatchId);
      client.emit('game:room-info-updated', { data: { ...gameMatch.info } });
      return { status: 'ok' };
    } catch (error) {
      return {
        status: 'error',
        data: { message: error.message },
      };
    }
  }
  @SubscribeMessage('game:leave')
  async leave(
    @MessageBody('gameMatchId') gameMatchId: string,
    @MessageBody('playerUsername') playerUsername: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const gameMatch = await this.gameMatchService.getGameMatch(gameMatchId);
      if (!gameMatch) throw new Error('Match not found');
      gameMatch.reset();

      client.leave('match-' + gameMatchId);
      client.emit('game:room-info-updated', { data: { ...gameMatch.info } });

      return { status: 'ok' };
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
      this.gameRoomNotifier.notifyGameMatchRoom(gameMatchId, {
        status: 'ok',
        message: 'User ' + playerUsername + ' join to room',
      });
      this.gameRoomNotifier.reportRoomMatchInfo(gameMatchId);
      return { status: 'ok' };
    } catch (error) {
      this.gameRoomNotifier.notifyGameMatchRoom(gameMatchId, {
        status: 'error',
        message: 'User cannot join to room because ' + error.message,
      });
      return { status: 'error' };
    }
  }
  @SubscribeMessage('game:choose-move')
  async chooseMove(
    @MessageBody('matchId') matchId: string,
    @MessageBody('username') username: string,
    @MessageBody('moveChoise') choise: Choice,
  ) {
    const gameMatch = await this.gameMatchService.getGameMatch(matchId);
    try {
      await this.gameMatchService.setPlayerMove(username, choise);
      this.gameRoomNotifier.notifyGameMatchRoom(matchId, {
        status: 'player-choose',
        message: username + ' choose the move',
        data: {
          user: username,
        },
      });
      if (gameMatch?.canPlayRound()) {
        gameMatch.playRound();
        this.gameRoomNotifier.notifyGameMatchRoom(matchId, {
          status: 'round-ended',
          message: 'The round is ended',
        });
        this.gameRoomNotifier.reportRoomMatchInfo(matchId);
      }
    } catch (error) {
      return {
        status: 'error',
        message: error?.message,
      };
    }
  }
}
