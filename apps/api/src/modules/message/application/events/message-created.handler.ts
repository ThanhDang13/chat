import { MessageCreatedEvent } from "@api/modules/message/domain/message.events";
import { IEventHandler } from "@api/shared/events/event-handler";
import { Server as SocketIOServer } from "socket.io";

export class MessageCreatedEventHandler implements IEventHandler<MessageCreatedEvent> {
  private readonly io: SocketIOServer;
  constructor({ io }: { io: SocketIOServer }) {
    this.io = io;
  }

  async handle(event: MessageCreatedEvent) {
    this.io
      .to(event.payload.message.conversationId)
      .emit("conversation:message:created", event.payload.message);
  }
}
