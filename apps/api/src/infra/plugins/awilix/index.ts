import { fastifyAwilixPlugin } from "@fastify/awilix";
import { asValue } from "awilix";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { diContainer } from "@fastify/awilix";
import { db } from "@api/infra/database";
import { redis } from "@api/infra/redis";

export default fp(
  async function (fastify: FastifyInstance) {
    await fastify.register(fastifyAwilixPlugin, {
      injectionMode: "PROXY",
      disposeOnClose: true,
      disposeOnResponse: true,
      strictBooleanEnforced: true
    });
    diContainer.register({
      db: asValue(db),
      redis: asValue(redis)
    });
  },
  { name: "awilix" }
);
