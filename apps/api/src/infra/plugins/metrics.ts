import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import fastifyMetrics from "fastify-metrics";

export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyMetrics, {
    endpoint: "/api/metrics",
    defaultMetrics: { enabled: true },
    routeMetrics: { enabled: true }
  });
});
