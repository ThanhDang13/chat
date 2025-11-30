import { Command } from "@api/shared/commands/command";

export type CreateConversationCommandPayload = {
  participantIds: string[];
  type: "private" | "group";
  createdBy: string;
  name?: string;
};

export class CreateConversationCommand implements Command<{ id: string }> {
  readonly type = "CreateConversationCommand";
  static readonly type = "CreateConversationCommand";

  constructor(public readonly payload: CreateConversationCommandPayload) {}
}
