import { Query } from "@api/shared/queries/query";

export type GetPrivateConversationQueryPayload = {
  requesterId: string;
  targetUserId: string;
};

export class GetPrivateConversationQuery implements Query<string | null> {
  readonly type = "GetPrivateConversationQuery";
  static readonly type = "GetPrivateConversationQuery";

  constructor(public readonly payload: GetPrivateConversationQueryPayload) {}
}
