import { Module } from '@nestjs/common';
import { ChatLogRepository } from './repositories/chatlog.repository';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [ChatLogRepository, ChatGateway],
})
export class ChatModule {}
