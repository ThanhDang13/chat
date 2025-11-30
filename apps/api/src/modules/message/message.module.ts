import fp from "fastify-plugin";
import path from "path";
import AutoLoad from "@fastify/autoload";
import { FastifyInstance } from "fastify";
import { ModuleOptions } from "@api/app";
import { MessageCreatedEvent } from "@api/modules/message/domain/message.events";
import { MessageCreatedEventHandler } from "@api/modules/message/application/events/message-created.handler";
import { diContainer } from "@fastify/awilix";
import { asClass } from "awilix";
import { CreateMessageCommandHandler } from "@api/modules/message/application/commands/create-message/create-message.handler";
import { CreateMessageCommand } from "@api/modules/message/application/commands/create-message/create-message.command";
import { Socket } from "socket.io";
import { registerCreateMessageSocket } from "@api/modules/message/application/commands/create-message/create-message.socket";
import { GetMessagesQueryHandler } from "@api/modules/message/application/queries/get-messages/get-messages.handler";
import { GetMessagesQuery } from "@api/modules/message/application/queries/get-messages/get-messages.query";

export default fp(
  async (fastify: FastifyInstance, opts: ModuleOptions) => {
    // --- Load REST routes ---
    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "application"),
      indexPattern: /\.route\.(ts|js)$/,
      dirNameRoutePrefix: false,
      matchFilter: (filePath) => {
        return filePath.endsWith(".route.ts") || filePath.endsWith(".route.js");
      },
      options: {
        ...opts,
        apiTag: `messages`,
        apiPrefix: `${opts.apiPrefix}/v1`
      }
    });

    diContainer.register({
      createMessageCommandHandler: asClass(CreateMessageCommandHandler).scoped()
    });

    fastify.commandBus.register(
      CreateMessageCommand.type,
      fastify.diContainer.cradle.createMessageCommandHandler
    );

    diContainer.register({
      getMessagesQueryHandler: asClass(GetMessagesQueryHandler).scoped()
    });

    fastify.queryBus.register(
      GetMessagesQuery.type,
      fastify.diContainer.cradle.getMessagesQueryHandler
    );

    diContainer.register({
      messageCreatedEventHandler: asClass(MessageCreatedEventHandler).scoped()
    });

    fastify.ready(() => {
      fastify.eventBus.register(
        MessageCreatedEvent.type,
        fastify.diContainer.cradle.messageCreatedEventHandler
      );
      fastify.io.on("connection", (socket: Socket) => {
        registerCreateMessageSocket(socket, fastify);
      });
    });
  },
  { dependencies: ["socket.io", "event-bus", "command-bus", "awilix", "auth"] }
);
