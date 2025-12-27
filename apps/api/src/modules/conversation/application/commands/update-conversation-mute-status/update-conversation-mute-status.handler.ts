import { CommandHandler } from "@api/shared/commands/command-handler";
import { DataBase } from "@api/infra/database";
import { conversationParticipants } from "@api/infra/database/schema";
import { UpdateConversationMuteStatusCommand } from "./update-conversation-mute-status.command";
import { and, eq } from "drizzle-orm";

export class UpdateConversationMuteStatusCommandHandler implements CommandHandler<UpdateConversationMuteStatusCommand, void> {
  private readonly db: DataBase;

  constructor({ db }: { db: DataBase }) {
    this.db = db;
  }

  async execute(command: UpdateConversationMuteStatusCommand): Promise<void> {
    await this.db.update(conversationParticipants).set({
      muted: command.payload.muted,
    }).where(
      and(
        eq(conversationParticipants.conversationId, command.payload.conversationId),
        eq(conversationParticipants.userId, command.payload.userId)
      )
    );
  }
}
