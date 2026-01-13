import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export default fp(async function (fastify: FastifyInstance) {
  const allowedOrigins = new Set([
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5174"
  ]);

  fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      if (allowedOrigins.has(origin)) {
        return cb(null, true);
      }

      cb(new Error(`Origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]
  });
});
