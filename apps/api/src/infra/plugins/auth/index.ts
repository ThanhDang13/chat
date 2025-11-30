import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { authenticate } from "@api/infra/plugins/auth/handlers";

export default fp(
  async function (fastify: FastifyInstance) {
    fastify.decorate("auth", {
      authenticate
    });
  },
  { name: "auth" }
);
