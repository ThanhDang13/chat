import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fp from "fastify-plugin";
import { ModuleOptions } from "@api/app";
import {
  loginResponseSchema,
  loginSchema
} from "@api/modules/auth/application/commands/login/login.dto";
import {
  LoginCommand,
  LoginCommandResult
} from "@api/modules/auth/application/commands/login/login.command";

export default fp(async function (fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    `/${opts.apiPrefix}/${opts.apiTag}/login`,
    {
      schema: {
        tags: [opts.apiTag],
        response: {
          200: loginResponseSchema
        },
        body: loginSchema
      }
    },
    async (request) => {
      const { email, password } = request.body;

      const result = await fastify.commandBus.execute<LoginCommand, LoginCommandResult>(
        new LoginCommand({ email, password })
      );

      return {
        message: "Login Successful",
        payload: result
      };
    }
  );
});
