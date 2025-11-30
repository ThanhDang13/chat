import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import fp from "fastify-plugin";
import { ModuleOptions } from "@api/app";
import { GetPresignedUploadUrlCommand } from "@api/modules/upload/application/commands/get-presigned-url/get-presigned-url.command";
import {
  PresignedUrl,
  presignedUrlRequestSchema,
  presignedUrlResponseSchema
} from "@api/modules/upload/application/commands/get-presigned-url/get-presigned-url.dto";

export default fp(async function (fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    `/${opts.apiPrefix}/uploads/presigned`,
    {
      preHandler: [fastify.auth.authenticate],
      schema: {
        summary: "Get a presigned URL for file upload",
        security: [{ bearer: [] }],
        tags: [opts.apiTag],
        body: presignedUrlRequestSchema,
        response: { 200: presignedUrlResponseSchema }
      }
    },
    async (request, reply) => {
      const { filename, contentType, folder } = request.body;

      const result = await fastify.commandBus.execute<GetPresignedUploadUrlCommand, PresignedUrl>(
        new GetPresignedUploadUrlCommand({ filename, contentType, folder })
      );

      return reply.code(200).send({ message: "OK", payload: result });
    }
  );
});
