import { Query } from "@api/shared/queries/query";

export interface QueryHandler<TQuery extends Query<TResponse>, TResponse> {
  execute(query: TQuery): Promise<TResponse>;
}
