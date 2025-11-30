import type { CallbackMessage } from "@api/modules/message/application/commands/create-message/create-message.dto";
import type { Message } from "@api/modules/message/domain/message.domain";
import { Command } from "@api/shared/commands/command";

type CreateMessageCommandPayload = {
  conversationId: string;
  senderId: string;
  content: string;
  tempId: string;
  type: Message["type"];
};

export class CreateMessageCommand implements Command<CallbackMessage> {
  static readonly type = "CreateMessageCommand";
  readonly type = "CreateMessageCommand";

  constructor(public readonly payload: CreateMessageCommandPayload) {}
}
