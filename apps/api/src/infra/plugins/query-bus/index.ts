import { Query } from "@api/shared/queries/query";
import { QueryHandler } from "@api/shared/queries/query-handler";
import { diContainer } from "@fastify/awilix";
import { asValue } from "awilix";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export class QueryBus {
  private handlers = new Map<string, QueryHandler<Query<unknown>, unknown>>();

  register<TQuery extends Query<TResponse>, TResponse>(
    type: TQuery["type"],
    handler: QueryHandler<TQuery, TResponse>
  ) {
    this.handlers.set(type, handler);
  }

  async execute<TQuery extends Query<TResponse>, TResponse>(Query: TQuery): Promise<TResponse> {
    const handler = this.handlers.get(Query.type) as QueryHandler<TQuery, TResponse> | undefined;

    if (!handler) {
      throw new Error(`No handler registered for Query type: ${Query.type}`);
    }

    return handler.execute(Query);
  }
}

export default fp(
  async function (fastify: FastifyInstance) {
    const bus = new QueryBus();

    diContainer.register({
      queryBus: asValue(bus)
    });

    fastify.decorate("queryBus", bus);
  },
  { name: "query-bus" }
);
