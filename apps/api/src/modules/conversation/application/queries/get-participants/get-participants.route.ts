import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import fp from "fastify-plugin";
import { ModuleOptions } from "@api/app";
import { GetParticipantsQuery } from "@api/modules/conversation/application/queries/get-participants/get-participants.query";
import {
  getParticipantsResponseSchema,
  ParticipantDTO
} from "@api/modules/conversation/application/queries/get-participants/get-participants.dto";

export default fp(async function (fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    `/${opts.apiPrefix}/${opts.apiTag}/:conversationId/participants`,
    {
      preHandler: [fastify.auth.authenticate],
      schema: {
        summary: "Get All Other Participants of Conversation with ID",
        security: [{ bearer: [] }],
        tags: [opts.apiTag],
        params: z.object({ conversationId: z.uuid() }),
        response: {
          200: getParticipantsResponseSchema
        }
      }
    },
    async (request) => {
      const { conversationId } = request.params;
      const userId = request.user.userId;

      const participants = await fastify.queryBus.execute<GetParticipantsQuery, ParticipantDTO[]>(
        new GetParticipantsQuery({ conversationId, userId })
      );

      return {
        message: "OK",
        payload: participants
      };
    }
  );
});
