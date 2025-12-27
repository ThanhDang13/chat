import type { Message } from "@api/modules/message/domain/message.domain";
import { Event } from "@api/shared/events/events";

export type MessageCreatedPayload = {
  message: Message;
};

export class MessageCreatedEvent implements Event<
  typeof MessageCreatedEvent.type,
  MessageCreatedPayload
> {
  static readonly type = "MessageCreatedEvent";
  readonly type = MessageCreatedEvent.type;
  constructor(public readonly payload: MessageCreatedPayload) {}
}
