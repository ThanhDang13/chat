import type { CreateMessageCommandHandler } from "@api/modules/message/application/commands/create-message/create-message.handler";
import type { MessageCreatedEventHandler } from "@api/modules/message/application/events/message-created.handler";
import type { GetMessagesQueryHandler } from "@api/modules/message/application/queries/get-messages/get-messages.handler";

declare module "@fastify/awilix" {
  interface Cradle {
    createMessageCommandHandler: CreateMessageCommandHandler;
  }
  interface Cradle {
    getMessagesQueryHandler: GetMessagesQueryHandler;
  }
  interface Cradle {
    messageCreatedEventHandler: MessageCreatedEventHandler;
  }
}

// Treat this file as a module
export {};
