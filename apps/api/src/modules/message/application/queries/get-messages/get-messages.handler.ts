import type { DataBase } from "@api/infra/database";
import { conversations } from "@api/infra/database/schema";
import { GetMessagesQuery } from "@api/modules/message/application/queries/get-messages/get-messages.query";
import type { Message } from "@api/modules/message/domain/message.domain";
import { NotFoundError } from "@api/shared/errors/not-found.error";
import { QueryHandler } from "@api/shared/queries/query-handler";
import type {
  BidirectionalCursorPaginated,
  BidirectionalCursorPagingDTO,
  CursorPagingDTO,
  Paginated
} from "@api/shared/types/pagination";
import { asc, eq } from "drizzle-orm";

export class GetMessagesQueryHandler implements QueryHandler<
  GetMessagesQuery,
  BidirectionalCursorPaginated<Message>
> {
  private readonly db: DataBase;

  constructor({ db }: { db: DataBase }) {
    this.db = db;
  }

  async execute(query: GetMessagesQuery): Promise<BidirectionalCursorPaginated<Message>> {
    const { conversationId, paging: rawPaging } = query.payload;
    const paging = rawPaging as BidirectionalCursorPagingDTO;

    const conversation = await this.db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId)
    });
    if (!conversation) throw new NotFoundError("Conversation not found");

    const messagesQuery = this.db.query.messages.findMany({
      where: (fields, { eq, and, gt, lt }) => {
        const conditions = [eq(fields.conversationId, conversationId)];

        if (paging.after) {
          conditions.push(gt(fields.id, paging.after));
        }
        if (paging.before) {
          conditions.push(lt(fields.id, paging.before));
        }

        return and(...conditions);
      },
      orderBy: (fields, { desc, asc }) => {
        if (paging.after) return asc(fields.id);
        return desc(fields.id);
      },
      limit: paging.limit + 1
    });

    const fetchedMessages = await messagesQuery;

    const hasMore = fetchedMessages.length > paging.limit;
    let data = hasMore ? fetchedMessages.slice(0, paging.limit) : fetchedMessages;

    if (!paging.after) data = data.reverse();

    const prevCursor = data.length > 0 ? data[0].id : undefined;
    const nextCursor = data.length > 0 ? data[data.length - 1].id : undefined;

    let hasNextPage = false;
    let hasPrevPage = false;

    if (paging.after) {
      hasNextPage = hasMore;
      hasPrevPage = true;
    } else if (paging.before) {
      hasPrevPage = hasMore;
      hasNextPage = true;
    } else {
      hasNextPage = false;
      hasPrevPage = hasMore;
    }

    return {
      type: "cursor",
      data,
      paging,
      nextCursor,
      prevCursor,
      hasNextPage,
      hasPrevPage
    };
  }
}
