import "fastify";
import { authenticate } from "@api/infra/plugins/auth/handlers";

declare module "fastify" {
  interface FastifyInstance {
    auth: {
      authenticate: authenticate;
    };
  }
  interface FastifyRequest {
    user?: {
      userId: string;
    };
  }
}
