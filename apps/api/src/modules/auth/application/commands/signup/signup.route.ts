import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fp from "fastify-plugin";
import { ModuleOptions } from "@api/app";
import {
  signupResponseSchema,
  signupSchema
} from "@api/modules/auth/application/commands/signup/signup.dto";
import { SignUpCommand } from "@api/modules/auth/application/commands/signup/signup.command";

export default fp(async function (fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    `/${opts.apiPrefix}/${opts.apiTag}/signup`,
    {
      schema: {
        tags: [opts.apiTag],
        body: signupSchema,
        response: {
          200: signupResponseSchema
        }
      }
    },
    async (request) => {
      const { fullname, email, password } = request.body;

      await fastify.commandBus.execute<SignUpCommand, void>(
        new SignUpCommand({ fullname, email, password })
      );

      return {
        message: "Signup Successful"
      };
    }
  );
});
