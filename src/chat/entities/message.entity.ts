export class ChatMessageEntity {
  constructor(
    private senderId: string,
    private message: string,
    private receiverId?: string,
  ) {}
  sendTo(receiverId: string) {
    this.receiverId = receiverId;
  }
}
