import type { DataBase } from "@api/infra/database";
import { conversationParticipants } from "@api/infra/database/schema";
import { UserConnectedEvent } from "@api/modules/conversation/domain/conversation.events";
import { IEventHandler } from "@api/shared/events/event-handler";
import { eq } from "drizzle-orm";
import type Redis from "ioredis";
import type { Server as SocketIOServer } from "socket.io";

export class UserConnectedEventHandler implements IEventHandler<UserConnectedEvent> {
  private readonly io: SocketIOServer;
  private readonly db: DataBase;
  private readonly redis: Redis;
  constructor({ io, db, redis }: { io: SocketIOServer; db: DataBase; redis: Redis }) {
    this.io = io;
    this.db = db;
    this.redis = redis;
  }

  async handle(event: UserConnectedEvent) {
    const socket = this.io.sockets.sockets.get(event.payload.socketId);
    const conversationsOfUser = await this.db
      .select({ id: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, socket.data.user.id));
    socket.data.conversations = conversationsOfUser;
    socket.join(`user:${socket.data.user.id}`);
    conversationsOfUser.map(async (conversation) => {
      socket.join(conversation.id);
      socket
        .to(conversation.id)
        .emit("user:status:update", { userId: socket.data.user.id, status: "online" });
      await this.redis.sadd(`presence:conversation:${conversation.id}`, socket.data.user.id);
    });
  }
}
