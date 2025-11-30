import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fp from "fastify-plugin";
import { ModuleOptions } from "@api/app";
import { GetConversationsQuery } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.query";
import { CursorPaginated, cursorPagingDTOSchema, Paginated } from "@api/shared/types/pagination";
import {
  ConversationDTO,
  getConversationsResponseSchema
} from "@api/modules/conversation/application/queries/get-conversations/get-conversations.dto";

export default fp(async function routes(fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    `/${opts.apiPrefix}/${opts.apiTag}`,
    {
      preHandler: [fastify.auth.authenticate],
      schema: {
        security: [{ bearer: [] }],
        tags: [opts.apiTag],
        response: { 200: getConversationsResponseSchema },
        querystring: cursorPagingDTOSchema
      }
    },
    async (request, reply) => {
      const userId = request.user.userId;
      const { cursor, limit, type } = request.query;

      const conversations = await fastify.queryBus.execute<
        GetConversationsQuery,
        Paginated<ConversationDTO>
      >(new GetConversationsQuery({ userId, paging: { cursor, limit, type } }));
      return reply.code(200).send({
        message: "OK",
        payload: conversations as CursorPaginated<ConversationDTO>
      });
    }
  );
});
