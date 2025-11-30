import { Query } from "@api/shared/queries/query";

type GetUserByIdQueryPayload = {
  id: string;
};

export class GetUserByIdQuery implements Query<unknown> {
  static readonly type = "GetUserByIdQuery";
  readonly type = "GetUserByIdQuery";
  constructor(public readonly payload: GetUserByIdQueryPayload) {}
}
