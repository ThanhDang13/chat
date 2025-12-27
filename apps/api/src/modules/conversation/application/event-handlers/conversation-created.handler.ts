import type { DataBase } from "@api/infra/database";
import { conversationParticipants } from "@api/infra/database/schema";
import { ConversationCreatedEvent } from "@api/modules/conversation/domain/conversation.events";
import { IEventHandler } from "@api/shared/events/event-handler";
import { eq } from "drizzle-orm";

import type { Server as SocketIOServer } from "socket.io";

export class ConversationCreatedEventHandler implements IEventHandler<ConversationCreatedEvent> {
  private readonly io: SocketIOServer;
  private readonly db: DataBase;

  constructor({ io, db }: { io: SocketIOServer; db: DataBase }) {
    this.io = io;
    this.db = db;
  }

  async handle(event: ConversationCreatedEvent) {
    const { conversationId, participantIds, createdBy, name, isGroup } = event.payload;

    try {
      const participants = await this.db
        .select({
          userId: conversationParticipants.userId
        })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.conversationId, conversationId));

      for (const p of participants) {
        this.io.to(`user:${p.userId}`).socketsJoin(conversationId);
      }

      //TODO: Listen to this in fe
      if (isGroup) {
        this.io.to(conversationId).emit("group:created", {
          conversationId
        });
      }
    } catch (error) {
      console.error("Error handling ConversationCreatedEvent:", error);
    }
  }
}
