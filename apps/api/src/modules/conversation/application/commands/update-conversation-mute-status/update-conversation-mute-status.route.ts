import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fp from "fastify-plugin";
import { ModuleOptions } from "@api/app";
import { UpdateConversationMuteStatusCommand } from "./update-conversation-mute-status.command";
import {
  updateConversationMuteStatusBodySchema,
  updateConversationMuteStatusResponseSchema
} from "./update-conversation-mute-status.dto";
import z from "zod";

export default fp(async function routes(fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().patch(
    `/${opts.apiPrefix}/${opts.apiTag}/:conversationId/mute`,
    {
      preHandler: [fastify.auth.authenticate],
      schema: {
        security: [{ bearer: [] }],
        tags: [opts.apiTag],
        summary: "Update mute status for a conversation",
        params: z.object({
          conversationId: z.uuid()
        }),
        body: updateConversationMuteStatusBodySchema,
        response: {
          200: updateConversationMuteStatusResponseSchema
        }
      }
    },
    async (request, reply) => {
      const userId = request.user.userId;
      const { conversationId } = request.params;
      const { muted } = request.body;

      await fastify.commandBus.execute<UpdateConversationMuteStatusCommand, void>(
        new UpdateConversationMuteStatusCommand({
          conversationId,
          userId,
          muted
        })
      );

      return reply.code(200).send({
        message: "OK"
      });
    }
  );
});
