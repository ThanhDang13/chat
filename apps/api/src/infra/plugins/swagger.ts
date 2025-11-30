import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fp from "fastify-plugin";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export default fp(async (fastify) => {
  fastify.register(swagger, {
    openapi: {
      info: {
        title: "Chat API",
        description: "Chat API documentation",
        version: "1.0.0"
      },
      servers: [
        {
          url: "http://localhost",
          description: "Development server"
        }
      ],
      components: {
        securitySchemes: {
          bearer: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      }
    },
    transform: jsonSchemaTransform
  });

  fastify.register(swaggerUi, {
    routePrefix: "/api/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false
    }
  });
});
