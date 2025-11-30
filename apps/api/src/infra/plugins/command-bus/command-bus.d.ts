import { CommandBus } from "@api/infra/plugins/command-bus";
import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    commandBus: CommandBus;
  }
}

declare module "@fastify/awilix" {
  interface Cradle {
    commandBus: CommandBus;
  }
}
