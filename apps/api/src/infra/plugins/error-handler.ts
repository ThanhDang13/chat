import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { BaseError } from "@api/shared/errors/base.error";
import { ZodError } from "zod";
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError
} from "fastify-type-provider-zod";

export default fp(
  async function (fastify: FastifyInstance) {
    fastify.setErrorHandler((error: unknown, request: FastifyRequest, reply: FastifyReply) => {
      // --- Domain / Business errors ---
      if (error instanceof BaseError) {
        request.log.warn(`Handled error: ${error.name} - ${error.message}`);
        return reply.status(error.httpStatus).send({
          error: error.name,
          message: error.message
        });
      }

      // --- Request validation errors (Fastify+Zod type provider) ---
      if (hasZodFastifySchemaValidationErrors(error)) {
        request.log.warn(`Request validation error`);
        return reply.status(400).send({
          error: "RequestValidationError",
          message: "Request doesn't match the schema",
          issues: error.validation, // Fastify's validation array
          method: request.method,
          url: request.url
        });
      }

      // --- Response serialization errors (Fastify+Zod type provider) ---
      if (isResponseSerializationError(error)) {
        request.log.error({ err: error }, "Response serialization error");
        return reply.status(500).send({
          error: "ResponseSerializationError",
          message: "Response doesn't match the schema",
          issues: error.cause?.issues,
          method: error.method,
          url: error.url
        });
      }

      // --- Raw Zod errors (e.g. from manual schema parsing) ---
      if (error instanceof ZodError) {
        request.log.warn(`Zod validation error: ${error.message}`);
        return reply.status(400).send({
          error: "ValidationError",
          message: "Invalid request data",
          issues: error.issues
        });
      }

      // --- Generic unhandled errors ---
      if (error instanceof Error) {
        request.log.error({ err: error }, `Unhandled error: ${error.message}`);
        return reply.status(500).send({
          error: "InternalServerError",
          message: "Something went wrong"
        });
      }

      // --- Non-error thrown values ---

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request.log.error({ error, cause: (error as any).stack }, `Unknown error occurred`);
      return reply.status(500).send({
        error: "InternalServerError",
        message: "Something went wrong"
      });
    });
  },
  { name: "error-handler" }
);
