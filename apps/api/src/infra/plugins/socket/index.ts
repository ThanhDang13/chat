import { UserConnectedEvent } from "@api/modules/conversation/domain/conversation.events";
import { UnauthorizedError } from "@api/shared/errors/unauthorized.error";
import { verifyToken } from "@api/utils/jwt";
import { diContainer } from "@fastify/awilix";
import { asValue } from "awilix";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fastifySocketIO from "fastify-socket.io";
import { Socket } from "socket.io";

export default fp(
  async function (fastify: FastifyInstance) {
    fastify.register(fastifySocketIO, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    fastify.ready(() => {
      fastify.io.use((socket, next) => {
        try {
          const token = socket.handshake.auth?.token;
          if (!token) return next(new UnauthorizedError("No token"));
          const payload = verifyToken(token);
          socket.data.user = { id: payload.userId };
          next();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          next(new UnauthorizedError("Unauthorized"));
        }
      });
      diContainer.register({ io: asValue(fastify.io) });
      fastify.io.on("connection", (socket: Socket) => {
        fastify.log.info(`✔️ Connected:, ${socket.id}, User:, ${socket.data.user.id}`);
        socket.on("disconnect", async () => {
          fastify.log.info(`❌ Disconnected:", ${socket.id}, User:, ${socket.data.user.id}`);
        });
      });
    });
    fastify.addHook("onClose", (fastify, done) => {
      fastify.io.close();
      done();
    });

    //     socket.on("conversation-read", async ({ conversationId, lastMessageId, userId }) => {
    //       try {
    //         console.log("Received conversation-read:", { conversationId, lastMessageId, userId });
    //         // Update last read message for this user in your DB
    //         await db
    //           .update(conversationParticipants)
    //           .set({ lastReadMessageId: lastMessageId })
    //           .where(
    //             and(
    //               eq(conversationParticipants.conversationId, conversationId),
    //               eq(conversationParticipants.userId, userId)
    //             )
    //           );

    //         // Optionally, notify other participants that this user has read up to lastMessageId
    //         // const participants = await db
    //         //   .select({ userId: conversationParticipants.userId })
    //         //   .from(conversationParticipants)
    //         //   .where(eq(conversationParticipants.conversationId, conversationId));

    //         // participants.forEach((p) => {
    //         //   if (p.userId !== userId) {
    //         //     io.to(p.userId).emit("userRead", {
    //         //       conversationId,
    //         //       userId,
    //         //       lastMessageId
    //         //     });
    //         //   }
    //         // });
    //         socket.to(conversationId).emit("user-read", { conversationId, lastMessageId, userId });
    //       } catch (err) {
    //         console.error("Error updating last read message", err);
    //       }
    //     })
  },
  { name: "socket.io", dependencies: ["auth"] }
);
