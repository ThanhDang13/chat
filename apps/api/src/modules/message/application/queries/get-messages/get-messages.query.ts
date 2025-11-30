import type { Message } from "@api/modules/message/domain/message.domain";
import type { Query } from "@api/shared/queries/query";
import type { Paginated, PagingDTO } from "@api/shared/types/pagination";

type GetMessagesQueryPayload = {
  conversationId: string;
  paging: PagingDTO;
};

export class GetMessagesQuery implements Query<Paginated<Message>> {
  static readonly type = "GetMessagesQuery";
  readonly type = "GetMessagesQuery";
  constructor(public payload: GetMessagesQueryPayload) {}
}
