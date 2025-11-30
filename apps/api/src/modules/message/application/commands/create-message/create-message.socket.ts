import { CreateMessageCommand } from "@api/modules/message/application/commands/create-message/create-message.command";
import type { CallbackMessage } from "@api/modules/message/application/commands/create-message/create-message.dto";
import type { Message } from "@api/modules/message/domain/message.domain";
import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";

export function registerCreateMessageSocket(socket: Socket, fastify: FastifyInstance) {
  socket.on(
    "conversation:message:create",
    async (
      payload: {
        conversationId: string;
        senderId: string;
        content: string;
        tempId: string;
        type: Message["type"];
      },
      callback: (args: unknown) => void
    ) => {
      try {
        const message = await fastify.commandBus.execute<CreateMessageCommand, CallbackMessage>(
          new CreateMessageCommand(payload)
        );
        callback(message);
      } catch (err) {
        console.error(err);
        socket.emit("conversation:message:error", {
          error: "Failed to send message",
          payload: payload.tempId
        });
      }
    }
  );
}
