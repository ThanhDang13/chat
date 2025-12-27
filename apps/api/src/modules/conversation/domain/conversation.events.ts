import { Event } from "@api/shared/events/events";

export type UserConnectedEventdPayload = {
  socketId: string;
};

export class UserConnectedEvent implements Event<
  typeof UserConnectedEvent.type,
  UserConnectedEventdPayload
> {
  static readonly type = "UserConnectedEvent";
  readonly type = UserConnectedEvent.type;
  constructor(public readonly payload: UserConnectedEventdPayload) {}
}

export type UserDisconnectedEventPayload = {
  userId: string;
  conversations: { id: string }[];
};

export class UserDisconnectedEvent implements Event<
  typeof UserDisconnectedEvent.type,
  UserDisconnectedEventPayload
> {
  static readonly type = "UserDisconnectedEvent";
  readonly type = UserDisconnectedEvent.type;

  constructor(public readonly payload: UserDisconnectedEventPayload) {}
}

export interface ConversationReadUpdateEventPayload {
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
}

export class ConversationReadUpdateEvent implements Event<
  typeof ConversationReadUpdateEvent.type,
  ConversationReadUpdateEventPayload
> {
  static readonly type = "ConversationReadUpdateEvent";
  readonly type = ConversationReadUpdateEvent.type;

  constructor(public readonly payload: ConversationReadUpdateEventPayload) {}
}

export interface ConversationCreatedEventPayload {
  conversationId: string;
  participantIds: string[];
  isGroup: boolean;
  name: string | null;
  createdBy: string;
}

export class ConversationCreatedEvent implements Event<
  typeof ConversationCreatedEvent.type,
  ConversationCreatedEventPayload
> {
  static readonly type = "ConversationCreatedEvent";
  readonly type = ConversationCreatedEvent.type;

  constructor(public readonly payload: ConversationCreatedEventPayload) {}
}
