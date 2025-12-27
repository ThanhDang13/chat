import type { DataBase } from "@api/infra/database";
import { conversationParticipants, conversations, messages } from "@api/infra/database/schema";
import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.dto";
import { GetConversationsQuery } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.query";
import { QueryHandler } from "@api/shared/queries/query-handler";
import { CursorPagingDTO, Paginated } from "@api/shared/types/pagination";
import { and, eq, sql } from "drizzle-orm";
import type Redis from "ioredis";

export class GetConversationsQueryHandler implements QueryHandler<
  GetConversationsQuery,
  Paginated<ConversationDTO>
> {
  private readonly db: DataBase;
  private readonly redis: Redis;
  constructor({ db, redis }: { db: DataBase; redis: Redis }) {
    this.db = db;
    this.redis = redis;
  }

  async execute(query: GetConversationsQuery): Promise<Paginated<ConversationDTO>> {
    function unreadCountSql(userId: string) {
      return sql<number>`
        (
          SELECT
            LEAST(COUNT(*), 100)
          FROM
            (
              SELECT
                1
              FROM
                messages m
              WHERE
                m.conversation_id = conversations.id
                AND m.sender_id != ${userId}
                AND m.id > (
                  SELECT
                    cp2.last_read_message_id
                  FROM
                    conversation_participants cp2
                  WHERE
                    cp2.conversation_id = conversations.id
                    AND cp2.user_id = ${userId}
                )
              LIMIT
                100
            ) AS limited
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

    const paging = query.payload.paging as CursorPagingDTO;

    const userConversations = await this.db.query.conversations.findMany({
      with: {
        messages: {
          orderBy: (m, { desc }) => [desc(m.id)],
          limit: 1,
          // with: {
          //   sender: {
          //     columns: { fullname: true }
          //   }
          // },
          columns: { id: true, senderId: true, content: true, type: true, timestamp: true }
        },
        participants: {
          columns: {
            conversationId: true,
            userId: true,
            muted: true
          },
          with: {
            user: {
              columns: {
                fullname: true,
                avatar: true,
                bio: true
              }
            }
          }
        }
      },
      columns: {
        id: true,
        isGroup: true,
        name: true,
        createdAt: true,
        updatedAt: true
      },
      extras: {
        unreadCount: unreadCountSql(query.payload.userId),
        sortTimestamp: sortTimestampSql.as("sortTimestamp")
      },
      where: (c, { exists, lt }) => {
        const conditions = [
          exists(
            this.db
              .select()
              .from(conversationParticipants)
              .where(
                and(
                  eq(conversationParticipants.conversationId, c.id),
                  eq(conversationParticipants.userId, query.payload.userId)
                )
              )
          )
        ];

        if (paging.cursor) {
          conditions.push(lt(sortTimestampSql, paging.cursor));
        }

        return and(...conditions);
      },
      orderBy: (c, { desc }) => [desc(sortTimestampSql)],
      limit: query.payload.paging.limit + 1
    });

    const hasNextPage = userConversations.length > query.payload.paging.limit;
    const sliced = hasNextPage
      ? userConversations.slice(0, query.payload.paging.limit)
      : userConversations;

    const items: ConversationDTO[] = await Promise.all(
      sliced.map(async (conv) => {
        const lastMessage = conv.messages[0] ?? null;
        const thisConversation = userConversations.find((i) => i.id === conv.id);

        const otherParticipants = (thisConversation?.participants ?? []).filter(
          (p) => p.userId !== query.payload.userId
        );

        const thisUser = (thisConversation?.participants ?? []).find(
          (p) => p.userId === query.payload.userId
        );

        const online = new Set(await this.redis.smembers(`presence:conversation:${conv.id}`));

        return {
          id: conv.id,
          isGroup: conv.isGroup,
          name: conv.isGroup ? conv.name : (otherParticipants[0]?.user.fullname ?? conv.name),
          avatar: conv.isGroup ? null : (otherParticipants[0]?.user.avatar ?? null),
          bio: conv.isGroup ? null : (otherParticipants[0]?.user.bio ?? null),
          participants: otherParticipants.map((p) => ({
            userId: p.userId,
            status: online.has(p.userId) ? ("online" as const) : ("offline" as const),
            username: p.user.fullname
          })),
          isMuted: thisUser.muted,
          lastMessage,
          unreadCount: conv.unreadCount,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          sortTimestamp: conv.sortTimestamp
        };
      })
    );

    const nextCursor =
      hasNextPage && items.length > 0 ? items[items.length - 1]?.sortTimestamp : undefined;

    return {
      type: "cursor",
      paging: paging,
      data: items,
      hasNextPage,
      nextCursor
    };
  }
}
