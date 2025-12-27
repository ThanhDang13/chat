import { Command } from "@api/shared/commands/command";

type UpdateConversationMuteStatusCommandPayload = {
  conversationId: string;
  userId: string;
  muted: boolean;
};

export class UpdateConversationMuteStatusCommand implements Command<void> {
  static readonly type = "UpdateConversationMuteStatusCommand";
  readonly type = "UpdateConversationMuteStatusCommand";

  constructor(public readonly payload: UpdateConversationMuteStatusCommandPayload) {}
}
