import { CommandHandler } from "@api/shared/commands/command-handler";
import { CreateConversationCommand } from "./create-conversation.command";
import { DataBase } from "@api/infra/database";
import { conversations, conversationParticipants } from "@api/infra/database/schema";
import { ConversationCreatedEvent } from "@api/modules/conversation/domain/conversation.events";
import { RedisEventBus } from "@api/infra/plugins/event-bus";

export class CreateConversationCommandHandler implements CommandHandler<
  CreateConversationCommand,
  { id: string }
> {
  private readonly db: DataBase;
  private readonly eventBus: RedisEventBus;
  constructor({ db, eventBus }: { db: DataBase; eventBus: RedisEventBus }) {
    this.db = db;
    this.eventBus = eventBus;
  }

  async execute(command: CreateConversationCommand): Promise<{ id: string }> {
    const { participantIds, type, createdBy, name } = command.payload;
    const isGroup = type === "group";

    const [conv] = await this.db
      .insert(conversations)
      .values({
        isGroup,
        name: isGroup ? (name ?? "New Group") : null,
        createdBy
      })
      .returning({ id: conversations.id });

    await this.db.insert(conversationParticipants).values(
      participantIds.map((userId) => ({
        conversationId: conv.id,
        userId,
        isGroup,
        role: userId === createdBy ? "owner" : "member"
      }))
    );

    this.eventBus.publish(
      new ConversationCreatedEvent({
        conversationId: conv.id,
        participantIds,
        isGroup,
        name: isGroup ? (name ?? "New Group") : null,
        createdBy
      })
    );

    return { id: conv.id };
  }
}
