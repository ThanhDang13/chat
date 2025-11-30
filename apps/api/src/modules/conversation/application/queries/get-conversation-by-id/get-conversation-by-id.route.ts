import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fp from "fastify-plugin";
import { z } from "zod";
import { ModuleOptions } from "@api/app";
import { GetConversationByIdQuery } from "@api/modules/conversation/application/queries/get-conversation-by-id/get-conversation-by-id.query";
import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.dto";
import { getConversationByIdResponseSchema } from "@api/modules/conversation/application/queries/get-conversation-by-id/get-conversation-by-id.dto";

export default fp(async function routes(fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    `/${opts.apiPrefix}/${opts.apiTag}/:conversationId`,
    {
      preHandler: [fastify.auth.authenticate],
      schema: {
        security: [{ bearer: [] }],
        tags: [opts.apiTag],
        params: z.object({
          conversationId: z.string().uuid()
        }),
        response: {
          200: getConversationByIdResponseSchema
        }
      }
    },
    async (request, reply) => {
      const userId = request.user.userId;
      const { conversationId } = request.params;

      const conversation = await fastify.queryBus.execute<
        GetConversationByIdQuery,
        ConversationDTO
      >(new GetConversationByIdQuery({ conversationId, userId }));

      return reply.code(200).send({
        message: "OK",
        payload: conversation
      });
    }
  );
});
