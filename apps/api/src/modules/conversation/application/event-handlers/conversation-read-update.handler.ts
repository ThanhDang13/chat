import type { DataBase } from "@api/infra/database";
import { conversationParticipants } from "@api/infra/database/schema";
import { ConversationReadUpdateEvent } from "@api/modules/conversation/domain/conversation.events";
import { IEventHandler } from "@api/shared/events/event-handler";
import { and, eq } from "drizzle-orm";

import type { Server as SocketIOServer } from "socket.io";

export class ConversationReadUpdateEventHandler implements IEventHandler<ConversationReadUpdateEvent> {
  private readonly io: SocketIOServer;
  private readonly db: DataBase;

  constructor({ io, db }: { io: SocketIOServer; db: DataBase }) {
    this.io = io;
    this.db = db;
  }

  async handle(event: ConversationReadUpdateEvent) {
    try {
      await this.db
        .update(conversationParticipants)
        .set({ lastReadMessageId: event.payload.lastReadMessageId })
        .where(
          and(
            eq(conversationParticipants.conversationId, event.payload.conversationId),
            eq(conversationParticipants.userId, event.payload.userId)
          )
        );

      this.io.to(event.payload.conversationId).emit("conversation:read:update", {
        userId: event.payload.userId,
        lastReadMessageId: event.payload.lastReadMessageId
      });
    } catch (err) {
      console.error("Error updating last read message", err);
    }
  }
}
