import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import fp from "fastify-plugin";
import { ModuleOptions } from "@api/app";
import { GetPrivateConversationQuery } from "@api/modules/conversation/application/queries/get-private-conversation/get-private-conversation.query";
import {
  OpenPrivateConversationResponseDTO,
  openPrivateConversationResponseSchema
} from "@api/modules/conversation/application/commands/open-private-conversation/open-private-conversation.dto";
import { CreateConversationCommand } from "@api/modules/conversation/application/commands/create-conversation/create-conversation.command";

export default fp(async function (fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    `/${opts.apiPrefix}/${opts.apiTag}/open/:targetUserId`,
    {
      preHandler: [fastify.auth.authenticate],
      schema: {
        summary: "Open (or create) a private conversation with another user",
        security: [{ bearer: [] }],
        tags: [opts.apiTag],
        params: z.object({
          targetUserId: z.uuid()
        }),
        response: {
          200: openPrivateConversationResponseSchema
        }
      }
    },
    async (request): Promise<OpenPrivateConversationResponseDTO> => {
      const requesterId = request.user.userId;
      const { targetUserId } = request.params;

      const existingConversationId = await fastify.queryBus.execute<
        GetPrivateConversationQuery,
        string | null
      >(
        new GetPrivateConversationQuery({
          requesterId,
          targetUserId
        })
      );

      if (existingConversationId) {
        return {
          message: "OK",
          payload: {
            conversationId: existingConversationId,
            created: false
          }
        };
      }

      const newConversation = await fastify.commandBus.execute<
        CreateConversationCommand,
        { id: string }
      >(
        new CreateConversationCommand({
          participantIds: [requesterId, targetUserId],
          type: "private",
          createdBy: requesterId
        })
      );

      return {
        message: "OK",
        payload: {
          conversationId: newConversation.id,
          created: true
        }
      };
    }
  );
});
