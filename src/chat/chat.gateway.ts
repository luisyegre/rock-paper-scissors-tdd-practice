import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatLogRepository } from './repositories/chatlog.repository';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  constructor(private chatLogRepo: ChatLogRepository) {}
  @SubscribeMessage('general:send-message')
  messageSendOnGeneral(
    @MessageBody('payload')
    payload: {
      username: string;
      message: string;
    },
  ) {
    this.chatLogRepo.register(
      { sender: payload.username, message: payload.message, room: 'general' },
      'general',
    );
    this.server.emit('general:new-message', payload);
  }

  @SubscribeMessage('match:join')
  joinMatchChat(
    @MessageBody('payload') payload: { matchId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join('match-' + payload.matchId);
  }

  @SubscribeMessage('sync')
  sync(
    @MessageBody('payload') { room }: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    // client.join('match-' + payload.matchId);
    const messages = this.chatLogRepo.getChatMessages(room);

    client.emit('sync-package', messages);
  }

  @SubscribeMessage('match:message-send')
  messageSendOnMatch(
    @MessageBody('payload')
    payload: {
      username: string;
      message: string;
      matchId: string;
    },
  ) {
    const room = 'match-' + payload.matchId;
    this.chatLogRepo.register(
      { sender: payload.username, message: payload.message, room },
      room,
    );
    this.server.to(room).emit('match:new-message', {
      username: payload.username,
      message: payload.message,
    });
  }
}
