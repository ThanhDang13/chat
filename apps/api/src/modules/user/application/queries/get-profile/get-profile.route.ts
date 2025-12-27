import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fp from "fastify-plugin";
import { ModuleOptions } from "@api/app";
import {
  getProfileResponseSchema,
  ProfileDTO
} from "./get-profile.dto";
import { GetProfileQuery } from "./get-profile.query";

export default fp(async function routes(fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    `/${opts.apiPrefix}/${opts.apiTag}/profile`,
    {
      preHandler: [fastify.auth.authenticate],
      schema: {
        security: [{ bearer: [] }],
        tags: [opts.apiTag],
        response: { 200: getProfileResponseSchema }
      }
    },
    async (request, reply) => {
      const userId = request.user.userId;

      const user = await fastify.queryBus.execute<GetProfileQuery, ProfileDTO>(
        new GetProfileQuery({ id: userId })
      );

      return reply.code(200).send({
        message: "OK",
        payload: user
      });
    }
  );
});