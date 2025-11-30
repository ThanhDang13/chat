import { ParticipantDTO } from "@api/modules/conversation/application/queries/get-participants/get-participants.dto";
import { Query } from "@api/shared/queries/query";

type GetParticipantsQueryPayLoad = {
  conversationId: string;
  userId: string;
};

export class GetParticipantsQuery implements Query<ParticipantDTO[]> {
  readonly type = "GetParticipantsQuery";
  static readonly type = "GetParticipantsQuery";
  constructor(public readonly payload: GetParticipantsQueryPayLoad) {}
}
