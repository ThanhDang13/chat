import type { DataBase } from "@api/infra/database";
import { conversationParticipants, conversations, messages } from "@api/infra/database/schema";
import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.dto";
import { GetConversationByIdQuery } from "./get-conversation-by-id.query";
import { QueryHandler } from "@api/shared/queries/query-handler";
import { and, eq, sql } from "drizzle-orm";
import type Redis from "ioredis";

export class GetConversationByIdQueryHandler
  implements QueryHandler<GetConversationByIdQuery, ConversationDTO>
{
  private readonly db: DataBase;
  private readonly redis: Redis;

  constructor({ db, redis }: { db: DataBase; redis: Redis }) {
    this.db = db;
    this.redis = redis;
  }

  async execute(query: GetConversationByIdQuery): Promise<ConversationDTO> {
    const { conversationId, userId } = query.payload;

    function unreadCountSql(userId: string) {
      return sql<number>`
        (
          SELECT
            COUNT(*)
          FROM
            ${messages} m
          WHERE
            m.conversation_id = ${conversations.id}
            AND m.timestamp > (
              SELECT
                m2.timestamp
              FROM
                ${messages} m2
                JOIN ${conversationParticipants} cp2 ON cp2.last_read_message_id = m2.id
              WHERE
                cp2.conversation_id = ${conversations.id}
                AND cp2.user_id = ${userId}
            )
        )
      `.as("unreadCount");
    }

    const sortTimestampSql = sql<Date>`
      COALESCE(
        (
          SELECT
            MAX(m3.timestamp)
          FROM
            ${messages} AS m3
          WHERE
            m3.conversation_id = ${conversations.id}
        ),
        ${conversations.updatedAt},
        NOW()
      )
    `;

    const isParticipant = await this.db.query.conversationParticipants.findFirst({
      where: (cp, { and, eq }) => and(eq(cp.conversationId, conversationId), eq(cp.userId, userId))
    });

    if (!isParticipant) {
      throw new Error("You are not a participant in this conversation");
    }

    const conv = await this.db.query.conversations.findFirst({
      where: (c, { eq }) => eq(c.id, conversationId),
      columns: {
        id: true,
        isGroup: true,
        name: true,
        createdAt: true,
        updatedAt: true
      },
      with: {
        messages: {
          orderBy: (m, { desc }) => [desc(m.timestamp)],
          limit: 1,
          columns: { id: true, senderId: true, content: true, type: true, timestamp: true }
        }
      },
      extras: {
        unreadCount: unreadCountSql(userId),
        sortTimestamp: sortTimestampSql.as("sortTimestamp")
      }
    });

    if (!conv) throw new Error("Conversation not found");

    const others = await this.db.query.conversationParticipants.findMany({
      where: (cp, { eq, ne }) => and(eq(cp.conversationId, conversationId), ne(cp.userId, userId)),
      columns: {
        conversationId: true,
        userId: true
      },
      with: {
        user: {
          columns: {
            fullname: true,
            avatar: true
          }
        }
      }
    });

    const online = new Set(await this.redis.smembers(`presence:conversation:${conversationId}`));

    const lastMessage = conv.messages[0] ?? null;
    const otherParticipants = others ?? [];

    return {
      id: conv.id,
      isGroup: conv.isGroup,
      name: conv.isGroup ? conv.name : (otherParticipants[0]?.user.fullname ?? conv.name),
      avatar: conv.isGroup ? null : (otherParticipants[0]?.user.avatar ?? null),
      participants: otherParticipants.map((p) => ({
        userId: p.userId,
        status: online.has(p.userId) ? ("online" as const) : ("offline" as const)
      })),
      lastMessage,
      unreadCount: conv.unreadCount,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      sortTimestamp: conv.sortTimestamp
    };
  }
}
