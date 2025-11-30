import { User } from "@api/modules/user/domain/user.domain";
import { Query } from "@api/shared/queries/query";
import type { Paginated, PagingDTO } from "@api/shared/types/pagination";

export type GetUsersByFilterQueryPayload = {
  currentUserId: string;
  keyword?: string;
  paging: PagingDTO;
};

export class GetUsersByFilterQuery implements Query<Paginated<User>> {
  static readonly type = "GetUserByFilterQuery";
  readonly type = "GetUserByFilterQuery";

  constructor(public readonly payload: GetUsersByFilterQueryPayload) {}
}
