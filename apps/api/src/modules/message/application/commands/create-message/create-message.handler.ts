import { RedisEventBus } from "@api/infra/plugins/event-bus";
import { MessageCreatedEvent } from "@api/modules/message/domain/message.events";
import { messages } from "@api/infra/database/schema";
import { DataBase } from "@api/infra/database";
import { CommandHandler } from "@api/shared/commands/command-handler";
import { CreateMessageCommand } from "@api/modules/message/application/commands/create-message/create-message.command";
import type { CallbackMessage } from "@api/modules/message/application/commands/create-message/create-message.dto";

export class CreateMessageCommandHandler
  implements CommandHandler<CreateMessageCommand, CallbackMessage>
{
  private readonly eventBus: RedisEventBus;
  private readonly db: DataBase;
  constructor({
    // messageRepository,
    db,
    eventBus
  }: {
    db: DataBase;
    eventBus: RedisEventBus;
  }) {
    this.eventBus = eventBus;
    this.db = db;
  }

  async execute(command: CreateMessageCommand) {
    const { conversationId, senderId, content, type, tempId } = command.payload;
    const [message] = await this.db
      .insert(messages)
      .values({
        conversationId: conversationId,
        senderId: senderId,
        content: content,
        type: type,
        timestamp: new Date()
      })
      .returning();

    const event = new MessageCreatedEvent({
      message: {
        ...message
      }
    });

    await this.eventBus.publish(event);

    return { ...message, tempId };
  }
}
