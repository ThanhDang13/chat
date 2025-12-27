import { Query } from "@api/shared/queries/query";
import type { ProfileDTO } from "./get-profile.dto";

type GetProfileQueryPayload = {
  id: string;
};

export class GetProfileQuery implements Query<ProfileDTO> {
  static readonly type = "GetProfileQuery";
  readonly type = "GetProfileQuery";
  constructor(public readonly payload: GetProfileQueryPayload) {}
}
