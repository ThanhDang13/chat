import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fp from "fastify-plugin";
import { ModuleOptions } from "@api/app";
import {
  changePasswordBodySchema,
  changePasswordResponseSchema
} from "@api/modules/user/application/commands/change-password/change-password.dto";
import { ChangePasswordCommand } from "@api/modules/user/application/commands/change-password/change-password.command";

export default fp(async function routes(fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().patch(
    `/${opts.apiPrefix}/${opts.apiTag}/password`,
    {
      preHandler: [fastify.auth.authenticate],
      schema: {
        security: [{ bearer: [] }],
        tags: [opts.apiTag],
        body: changePasswordBodySchema,
        response: { 200: changePasswordResponseSchema }
      }
    },
    async (request, reply) => {
      const userId = request.user.userId;

      await fastify.commandBus.execute<ChangePasswordCommand, void>(
        new ChangePasswordCommand({ id: userId, ...request.body })
      );

      return reply.code(200).send({
        message: "OK"
      });
    }
  );
});
