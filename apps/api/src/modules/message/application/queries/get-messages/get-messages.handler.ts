import type { DataBase } from "@api/infra/database";
import { conversations } from "@api/infra/database/schema";
import { GetMessagesQuery } from "@api/modules/message/application/queries/get-messages/get-messages.query";
import type { Message } from "@api/modules/message/domain/message.domain";
import { NotFoundError } from "@api/shared/errors/not-found.error";
import { QueryHandler } from "@api/shared/queries/query-handler";
import type { CursorPagingDTO, Paginated } from "@api/shared/types/pagination";
import { eq } from "drizzle-orm";

export class GetMessagesQueryHandler implements QueryHandler<GetMessagesQuery, Paginated<Message>> {
  private readonly db: DataBase;
  constructor({ db }: { db: DataBase }) {
    this.db = db;
  }

  async execute(query: GetMessagesQuery): Promise<Paginated<Message>> {
    const { conversationId } = query.payload;
    const paging = query.payload.paging as CursorPagingDTO;

    const conversation = await this.db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId)
    });
    if (!conversation) throw new NotFoundError("Conversation not found");

    const messages = await this.db.query.messages.findMany({
      where: (fields, { eq, and, lt }) =>
        and(
          eq(fields.conversationId, conversationId),
          paging.cursor ? lt(fields.timestamp, new Date(paging.cursor)) : undefined
        ),
      orderBy: (fields, { desc }) => desc(fields.timestamp),
      limit: paging.limit + 1
    });

    const hasNextPage = messages.length > paging.limit;
    const data = hasNextPage ? messages.slice(0, paging.limit) : messages;

    const nextCursor = hasNextPage && data.length > 0 ? data[data.length - 1].timestamp : undefined;

    return {
      type: "cursor",
      data,
      paging: {
        limit: paging.limit,
        cursor: paging.cursor ?? undefined,
        type: "cursor"
      },
      nextCursor,
      hasNextPage
    };
  }
}
