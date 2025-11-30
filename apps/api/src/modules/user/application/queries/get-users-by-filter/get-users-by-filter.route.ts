import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fp from "fastify-plugin";
import { ModuleOptions } from "@api/app";
import {
  getUsersByFilterResponseSchema,
  UserDTO
} from "@api/modules/user/application/queries/get-users-by-filter/get-users-by-filter.dto";
import { OffsetPaginated, offsetPagingDTOSchema } from "@api/shared/types/pagination";
import { GetUsersByFilterQuery } from "@api/modules/user/application/queries/get-users-by-filter/get-users-by-filter.query";
import z from "zod";

export default fp(async function routes(fastify: FastifyInstance, opts: ModuleOptions) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    `/${opts.apiPrefix}/${opts.apiTag}/search`,
    {
      preHandler: [fastify.auth.authenticate],
      schema: {
        security: [{ bearer: [] }],
        tags: [opts.apiTag],
        response: { 200: getUsersByFilterResponseSchema },
        querystring: offsetPagingDTOSchema.extend({ keyword: z.string().optional() })
      }
    },
    async (request, reply) => {
      const userId = request.user.userId;
      const { page, limit, order, sort } = request.query;

      const users = await fastify.queryBus.execute<GetUsersByFilterQuery, OffsetPaginated<UserDTO>>(
        new GetUsersByFilterQuery({
          currentUserId: userId,
          keyword: request.query.keyword,
          paging: { type: "offset", page, limit, order, sort }
        })
      );

      return reply.code(200).send({
        message: "OK",
        payload: users
      });
    }
  );
});
