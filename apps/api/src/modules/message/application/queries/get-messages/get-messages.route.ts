import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import fp from "fastify-plugin";
import { GetMessagesQuery } from "@api/modules/message/application/queries/get-messages/get-messages.query";
import { ModuleOptions } from "@api/app";
import { Message } from "@api/modules/message/domain/message.domain";
import { CursorPaginated, cursorPagingDTOSchema, Paginated } from "@api/shared/types/pagination";
import { getMessagesResponseSchema } from "@api/modules/message/application/queries/get-messages/get-messages.dto";

export default fp(async function (fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    `/${opts.apiPrefix}/conversations/:conversationId/messages`,
    {
      preHandler: [fastify.auth.authenticate],
      schema: {
        summary: "Get All Messages of Conversation with ID",
        security: [{ bearer: [] }],
        tags: [opts.apiTag],
        params: z.object({
          conversationId: z.uuid()
        }),
        response: { 200: getMessagesResponseSchema },
        querystring: cursorPagingDTOSchema
      }
    },
    async (request, reply) => {
      const { conversationId } = request.params;
      const { cursor, limit } = request.query;
      const messages = await fastify.queryBus.execute<GetMessagesQuery, Paginated<Message>>(
        new GetMessagesQuery({ conversationId, paging: { type: "cursor", limit, cursor } })
      );
      return reply.code(200).send({ message: "OK", payload: messages as CursorPaginated<Message> });
    }
  );
});
