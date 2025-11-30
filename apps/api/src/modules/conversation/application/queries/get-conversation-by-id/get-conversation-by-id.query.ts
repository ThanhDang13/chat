import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.dto";
import { Query } from "@api/shared/queries/query";

type GetConversationByIdQueryPayload = {
  conversationId: string;
  userId: string;
};

export class GetConversationByIdQuery implements Query<ConversationDTO> {
  readonly type = "GetConversationByIdQuery";
  static readonly type = "GetConversationByIdQuery";

  constructor(public payload: GetConversationByIdQueryPayload) {}
}
