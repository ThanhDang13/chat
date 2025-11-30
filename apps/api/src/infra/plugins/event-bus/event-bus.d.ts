import { RedisEventBus } from "@api/infra/plugins/event-bus/event-bus";
import "fastify";
import Redis from "ioredis";

declare module "fastify" {
  interface FastifyInstance {
    eventBus: RedisEventBus;
  }
}

declare module "@fastify/awilix" {
  interface Cradle {
    eventBus: RedisEventBus;
    redisPub: Redis;
    redisSub: Redis;
  }
}
