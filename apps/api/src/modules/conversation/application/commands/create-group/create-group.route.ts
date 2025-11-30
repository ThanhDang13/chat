import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fp from "fastify-plugin";
import { z } from "zod";
import { ModuleOptions } from "@api/app";
import { CreateConversationCommand } from "@api/modules/conversation/application/commands/create-conversation/create-conversation.command";
import { createGroupConversationResponseSchema } from "@api/modules/conversation/application/commands/create-group/create-group.dto";

export default fp(async function routes(fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    `/${opts.apiPrefix}/${opts.apiTag}/group`,
    {
      preHandler: [fastify.auth.authenticate],
      schema: {
        security: [{ bearer: [] }],
        tags: [opts.apiTag],
        summary: "Create a group conversation",
        body: z.object({
          name: z.string().min(1, "Group name is required"),
          participantIds: z.array(z.uuid()).min(1, "At least one participant required")
        }),
        response: {
          201: createGroupConversationResponseSchema
        }
      }
    },
    async (request, reply) => {
      const createdBy = request.user.userId;
      const { name, participantIds } = request.body;
      participantIds.push(createdBy);

      const command = new CreateConversationCommand({
        type: "group",
        name,
        participantIds,
        createdBy
      });

      const result = await fastify.commandBus.execute<CreateConversationCommand, { id: string }>(
        command
      );

      return reply.code(201).send({
        message: "Group created successfully",
        payload: result
      });
    }
  );
});
