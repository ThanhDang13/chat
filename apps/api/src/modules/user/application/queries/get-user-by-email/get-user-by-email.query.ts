import type { User } from "@api/modules/user/domain/user.domain";
import { Query } from "@api/shared/queries/query";

type GetUserByEmailQueryPayload = {
  email: string;
};

export class GetUserByEmailQuery implements Query<User> {
  static readonly type = "GetUserByEmailQuery";
  readonly type = "GetUserByEmailQuery";
  constructor(public readonly payload: GetUserByEmailQueryPayload) {}
}
