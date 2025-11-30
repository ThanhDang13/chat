import { UserDisconnectedEvent } from "@api/modules/conversation/domain/conversation.events";
import { IEventHandler } from "@api/shared/events/event-handler";
import type Redis from "ioredis";
import type { Server as SocketIOServer } from "socket.io";

export class UserDisconnectedEventHandler implements IEventHandler<UserDisconnectedEvent> {
  private readonly io: SocketIOServer;
  private readonly redis: Redis;
  constructor({ io, redis }: { io: SocketIOServer; redis: Redis }) {
    this.io = io;
    this.redis = redis;
  }

  async handle(event: UserDisconnectedEvent) {
    const { userId, conversations } = event.payload;

    for (const conversation of conversations) {
      await this.redis.srem(`presence:conversation:${conversation.id}`, userId);

      const isStillOnline = await this.redis.sismember(
        `presence:conversation:${conversation.id}`,
        userId
      );

      if (!isStillOnline) {
        this.io.to(conversation.id).emit("user:status:update", {
          userId,
          status: "offline"
        });
      }
    }
  }
}
