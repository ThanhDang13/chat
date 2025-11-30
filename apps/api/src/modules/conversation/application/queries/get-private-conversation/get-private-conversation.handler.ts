import { DataBase } from "@api/infra/database";
import { conversations, conversationParticipants } from "@api/infra/database/schema";
import { GetPrivateConversationQuery } from "./get-private-conversation.query";
import { QueryHandler } from "@api/shared/queries/query-handler";
import { and, eq, inArray } from "drizzle-orm";

export class GetPrivateConversationQueryHandler
  implements QueryHandler<GetPrivateConversationQuery, string | null>
{
  private readonly db: DataBase;

  constructor({ db }: { db: DataBase }) {
    this.db = db;
  }

  async execute(query: GetPrivateConversationQuery): Promise<string | null> {
    const { requesterId, targetUserId } = query.payload;

    // Step 1: Find all private conversations that requester participates in
    const requesterConversations = await this.db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .innerJoin(conversations, eq(conversationParticipants.conversationId, conversations.id))
      .where(
        and(eq(conversationParticipants.userId, requesterId), eq(conversations.isGroup, false))
      );

    if (requesterConversations.length === 0) return null;

    // Step 2: Check if target user is in one of them
    const existing = await this.db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(
        and(
          inArray(
            conversationParticipants.conversationId,
            requesterConversations.map((c) => c.conversationId)
          ),
          eq(conversationParticipants.userId, targetUserId)
        )
      )
      .limit(1);

    return existing.length > 0 ? existing[0].conversationId : null;
  }
}
