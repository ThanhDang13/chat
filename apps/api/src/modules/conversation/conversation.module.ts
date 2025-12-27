import fp from "fastify-plugin";
import path from "path";
import AutoLoad from "@fastify/autoload";
import { ModuleOptions } from "@api/app";
import { diContainer } from "@fastify/awilix";
import { asClass } from "awilix";
import { GetConversationsQuery } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.query";
import { GetConversationsQueryHandler } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.handler";
import { GetParticipantsQuery } from "@api/modules/conversation/application/queries/get-participants/get-participants.query";
import { GetParticipantsQueryHandler } from "@api/modules/conversation/application/queries/get-participants/get-participants.handler";
import { UserConnectedEventHandler } from "@api/modules/conversation/application/event-handlers/user-connected.handler";
import {
  ConversationCreatedEvent,
  ConversationReadUpdateEvent,
  UserConnectedEvent,
  UserDisconnectedEvent
} from "@api/modules/conversation/domain/conversation.events";
import { Socket } from "socket.io";
import { UserDisconnectedEventHandler } from "@api/modules/conversation/application/event-handlers/user-disconnected.handler";
import { ConversationReadUpdateEventHandler } from "@api/modules/conversation/application/event-handlers/conversation-read-update.handler";
import { GetPrivateConversationQueryHandler } from "@api/modules/conversation/application/queries/get-private-conversation/get-private-conversation.handler";
import { CreateConversationCommandHandler } from "@api/modules/conversation/application/commands/create-conversation/create-conversation.handler";
import { GetPrivateConversationQuery } from "@api/modules/conversation/application/queries/get-private-conversation/get-private-conversation.query";
import { CreateConversationCommand } from "@api/modules/conversation/application/commands/create-conversation/create-conversation.command";
import { GetConversationByIdQuery } from "@api/modules/conversation/application/queries/get-conversation-by-id/get-conversation-by-id.query";
import { GetConversationByIdQueryHandler } from "@api/modules/conversation/application/queries/get-conversation-by-id/get-conversation-by-id.handler";
import { UpdateConversationMuteStatusCommand } from "@api/modules/conversation/application/commands/update-conversation-mute-status/update-conversation-mute-status.command";
import { UpdateConversationMuteStatusCommandHandler } from "@api/modules/conversation/application/commands/update-conversation-mute-status/update-conversation-mute-status.handler";
import { ConversationCreatedEventHandler } from "@api/modules/conversation/application/event-handlers/conversation-created.handler";

export default fp(
  async (fastify, opts: ModuleOptions) => {
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
        apiTag: `conversations`,
        apiPrefix: `${opts.apiPrefix}/v1`
      }
    });

    diContainer.register({
      getConversationsQueryHandler: asClass(GetConversationsQueryHandler).scoped(),
      getParticipantsQueryHandler: asClass(GetParticipantsQueryHandler).scoped(),
      getPrivateConversationQueryHandler: asClass(GetPrivateConversationQueryHandler).scoped(),
      getConversationByIdQueryHandler: asClass(GetConversationByIdQueryHandler).scoped()
    });

    diContainer.register({
      userConnectedEventHandler: asClass(UserConnectedEventHandler).scoped(),
      userDisconnectedEventHandler: asClass(UserDisconnectedEventHandler).scoped(),
      conversationReadUpdateEventHandler: asClass(ConversationReadUpdateEventHandler).scoped(),
      conversationCreatedEventHandler: asClass(ConversationCreatedEventHandler).scoped()
    });

    diContainer.register({
      createConversationCommandHandler: asClass(CreateConversationCommandHandler).scoped(),
      updateConversationMuteStatusCommandHandler: asClass(
        UpdateConversationMuteStatusCommandHandler
      ).scoped()
    });

    fastify.queryBus.register(
      GetConversationsQuery.type,
      fastify.diContainer.cradle.getConversationsQueryHandler
    );

    fastify.queryBus.register(
      GetParticipantsQuery.type,
      fastify.diContainer.cradle.getParticipantsQueryHandler
    );

    fastify.queryBus.register(
      GetConversationByIdQuery.type,
      fastify.diContainer.cradle.getConversationByIdQueryHandler
    );

    fastify.queryBus.register(
      GetPrivateConversationQuery.type,
      fastify.diContainer.cradle.getPrivateConversationQueryHandler
    );

    fastify.commandBus.register(
      CreateConversationCommand.type,
      fastify.diContainer.cradle.createConversationCommandHandler
    );

    fastify.commandBus.register(
      UpdateConversationMuteStatusCommand.type,
      fastify.diContainer.cradle.updateConversationMuteStatusCommandHandler
    );

    fastify.ready(() => {
      fastify.eventBus.register(
        UserConnectedEvent.type,
        fastify.diContainer.cradle.userConnectedEventHandler
      );
      fastify.eventBus.register(
        UserDisconnectedEvent.type,
        fastify.diContainer.cradle.userDisconnectedEventHandler
      );
      fastify.eventBus.register(
        ConversationReadUpdateEvent.type,
        fastify.diContainer.cradle.conversationReadUpdateEventHandler
      );
      fastify.eventBus.register(
        ConversationCreatedEvent.type,
        fastify.diContainer.cradle.conversationCreatedEventHandler
      );
      fastify.io.on("connection", (socket: Socket) => {
        fastify.eventBus.publish(new UserConnectedEvent({ socketId: socket.id }));

        socket.on(
          "conversation:read:update",
          ({
            conversationId,
            lastReadMessageId
          }: {
            conversationId: string;
            lastReadMessageId: string;
          }) => {
            fastify.eventBus.publish(
              new ConversationReadUpdateEvent({
                conversationId,
                lastReadMessageId,
                userId: socket.data.user.id
              })
            );
          }
        );

        socket.on("conversation:typing:start", ({ conversationId }: { conversationId: string }) => {
          if (!conversationId) return;
          socket.to(conversationId).emit("conversation:typing:start", {
            conversationId,
            userId: socket.data.user.id
          });
        });

        socket.on("conversation:typing:stop", ({ conversationId }: { conversationId: string }) => {
          if (!conversationId) return;
          socket.to(conversationId).emit("conversation:typing:stop", {
            conversationId,
            userId: socket.data.user.id
          });
        });

        socket.on("disconnect", () => {
          fastify.eventBus.publish(
            new UserDisconnectedEvent({
              userId: socket.data.user.id,
              conversations: socket.data.conversations
            })
          );
        });
      });
    });
  },
  { dependencies: ["socket.io", "event-bus", "command-bus", "awilix", "auth"] }
);
