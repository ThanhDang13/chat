import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fp from "fastify-plugin";
import { ModuleOptions } from "@api/app";
import {
  updateProfileBodySchema,
  updateProfileResponseSchema
} from "@api/modules/user/application/commands/update-profile/update-profile.dto";
import { UpdateProfileCommand } from "@api/modules/user/application/commands/update-profile/update-profile.command";

export default fp(async function routes(fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().patch(
    `/${opts.apiPrefix}/${opts.apiTag}/profile`,
    {
      preHandler: [fastify.auth.authenticate],
      schema: {
        security: [{ bearer: [] }],
        tags: [opts.apiTag],
        body: updateProfileBodySchema,
        response: { 200: updateProfileResponseSchema }
      }
    },
    async (request, reply) => {
      const userId = request.user.userId;

      await fastify.commandBus.execute<UpdateProfileCommand, void>(
        new UpdateProfileCommand({ id: userId, ...request.body })
      );

      return reply.code(200).send({
        message: "OK"
      });
    }
  );
});
