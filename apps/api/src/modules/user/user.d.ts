import { type ChangePasswordCommandHandler } from "@api/modules/user/application/commands/change-password/change-password.handler";
import type { CreateUserCommandHandler } from "@api/modules/user/application/commands/create-user/create-user.handler";
import type { UpdateProfileCommandHandler } from "@api/modules/user/application/commands/update-profile/update-profile.handler";
import type { GetProfileQueryHandler } from "@api/modules/user/application/queries/get-profile/get-profile.handler";
import type { GetUserByEmailQueryHandler } from "@api/modules/user/application/queries/get-user-by-email/get-user-by-email.handler";
import type { GetUsersByFilterQueryHandler } from "@api/modules/user/application/queries/get-users-by-filter/get-users-by-filter.handler";

declare module "@fastify/awilix" {
  interface Cradle {
    createUserCommandHandler: CreateUserCommandHandler;
    updateProfileCommandHandler: UpdateProfileCommandHandler;
    changePasswordCommandHandler: ChangePasswordCommandHandler;
  }
  interface Cradle {
    getUserByEmailQueryHandler: GetUserByEmailQueryHandler;
    getUsersByFilterQueryHandler: GetUsersByFilterQueryHandler;
    getProfileQueryHandler: GetProfileQueryHandler;
  }
  // interface Cradle {

  // }
}

// Treat this file as a module
export {};
