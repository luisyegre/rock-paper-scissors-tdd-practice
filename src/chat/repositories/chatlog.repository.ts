import { Injectable } from '@nestjs/common';

interface MessagePayload {
  message: string;
  sender: string;
  room: string;
  reciver?: string;
}

@Injectable()
export class ChatLogRepository {
  chatMessages: Map<string, MessagePayload[]> = new Map();
  register(message: MessagePayload, room: string) {
    const messages = this.chatMessages.get(room);
    this.chatMessages.set(room, [...(messages || []), message]);
  }
  getChatMessages(
    room: string,
    pagination?: {
      start: number;
      end: number;
    },
  ) {
    return this.chatMessages.get(room) || ([] as MessagePayload[]);
  }
}
