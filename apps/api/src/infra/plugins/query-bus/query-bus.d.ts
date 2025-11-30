import { QueryBus } from "@api/infra/plugins/query-bus";
import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    queryBus: QueryBus;
  }
}

declare module "@fastify/awilix" {
  interface Cradle {
    queryBus: QueryBus;
  }
}
