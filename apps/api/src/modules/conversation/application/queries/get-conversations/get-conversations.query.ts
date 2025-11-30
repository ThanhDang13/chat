import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.dto";
import { Query } from "@api/shared/queries/query";
import { Paginated, PagingDTO } from "@api/shared/types/pagination";

type GetConversationsQueryPayload = {
  userId: string;
  paging: PagingDTO;
};

export class GetConversationsQuery implements Query<Paginated<ConversationDTO>> {
  readonly type = "GetConversationsQuery";
  static readonly type = "GetConversationsQuery";
  constructor(public payload: GetConversationsQueryPayload) {}
}
