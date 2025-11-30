import { FastifyInstance } from "fastify";
import { AccessToken } from "livekit-server-sdk";
import fp from "fastify-plugin";
import { ModuleOptions } from "@api/app";

export default fp(async function (fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.get(`/${opts.apiPrefix}/health`, async function () {
    return "OK";
  });

  fastify.get("/api/livekit-token", async (req, reply) => {
    const { identity } = req.query as { identity: string };

    if (!identity) {
      return reply.status(400).send({ error: "identity required" });
    }

    const at = new AccessToken("devkey", "secret", { identity });

    at.addGrant({
      roomJoin: true,
      room: "myroom",
      canPublish: true,
      canSubscribe: true
    });

    const token = await at.toJwt();
    console.log("Generated LiveKit JWT:", token);

    return { token };
  });
});
