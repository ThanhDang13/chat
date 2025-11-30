import type { CreateUserCommandHandler } from "@api/modules/user/application/commands/create-user/create-user.handler";
import type { GetUserByEmailQueryHandler } from "@api/modules/user/application/queries/get-user-by-email/get-user-by-email.handler";
import type { GetUsersByFilterQueryHandler } from "@api/modules/user/application/queries/get-users-by-filter/get-users-by-filter.handler";

declare module "@fastify/awilix" {
  interface Cradle {
    createUserCommandHandler: CreateUserCommandHandler;
  }
  interface Cradle {
    getUserByEmailQueryHandler: GetUserByEmailQueryHandler;
    getUsersByFilterQueryHandler: GetUsersByFilterQueryHandler;
  }
  // interface Cradle {

  // }
}

// Treat this file as a module
export {};
