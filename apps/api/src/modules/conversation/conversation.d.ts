import type { ConversationReadUpdateEventHandler } from "@api/modules/conversation/application/event-handlers/conversation-read-update.handler";
import type { UserConnectedEventHandler } from "@api/modules/conversation/application/event-handlers/user-connected.handler";
import type { UserDisconnectedEventHandler } from "@api/modules/conversation/application/event-handlers/user-disconnected.handler";
import type { GetConversationsQueryHandler } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.handler";
import type { GetParticipantsQueryHandler } from "@api/modules/conversation/application/queries/get-participants/get-participants.handler";
import type { GetPrivateConversationQueryHandler } from "@api/modules/conversation/application/queries/get-private-conversation/get-private-conversation.handler";

import type { CreateConversationCommandHandler } from "@api/modules/conversation/application/commands/create-conversation/create-conversation.handler";
import type { GetConversationByIdQueryHandler } from "@api/modules/conversation/application/queries/get-conversation-by-id/get-conversation-by-id.handler";
import type { UpdateConversationMuteStatusCommandHandler } from "@api/modules/conversation/application/commands/update-conversation-mute-status/update-conversation-mute-status.handler";
import type { ConversationCreatedEventHandler } from "@api/modules/conversation/application/event-handlers/conversation-created.handler";

declare module "@fastify/awilix" {
  interface Cradle {
    getConversationsQueryHandler: GetConversationsQueryHandler;
    getParticipantsQueryHandler: GetParticipantsQueryHandler;
    getPrivateConversationQueryHandler: GetPrivateConversationQueryHandler;
    getConversationByIdQueryHandler: GetConversationByIdQueryHandler;
  }
  interface Cradle {
    createConversationCommandHandler: CreateConversationCommandHandler;
    updateConversationMuteStatusCommandHandler: UpdateConversationMuteStatusCommandHandler;
  }
  interface Cradle {
    userConnectedEventHandler: UserConnectedEventHandler;
    userDisconnectedEventHandler: UserDisconnectedEventHandler;
    conversationReadUpdateEventHandler: ConversationReadUpdateEventHandler;
    conversationCreatedEventHandler: ConversationCreatedEventHandler;
  }
}

// Treat this file as a module
export {};
