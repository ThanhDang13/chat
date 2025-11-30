import fp from "fastify-plugin";
import path from "path";
import AutoLoad from "@fastify/autoload";
import { FastifyInstance } from "fastify";
import { ModuleOptions } from "@api/app";
import { diContainer } from "@fastify/awilix";
import { asClass } from "awilix";
import { CreateUserCommandHandler } from "@api/modules/user/application/commands/create-user/create-user.handler";
import { CreateUserCommand } from "@api/modules/user/application/commands/create-user/create-user.command";
import { GetUserByEmailQueryHandler } from "@api/modules/user/application/queries/get-user-by-email/get-user-by-email.handler";
import { GetUserByEmailQuery } from "@api/modules/user/application/queries/get-user-by-email/get-user-by-email.query";
import { GetUsersByFilterQueryHandler } from "@api/modules/user/application/queries/get-users-by-filter/get-users-by-filter.handler";
import { GetUsersByFilterQuery } from "@api/modules/user/application/queries/get-users-by-filter/get-users-by-filter.query";

export default fp(
  async (fastify: FastifyInstance, opts: ModuleOptions) => {
    // --- Load REST routes ---
    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "application"),
      indexPattern: /\.route\.(ts|js)$/,
      dirNameRoutePrefix: false,
      matchFilter: (filePath) => {
        return filePath.endsWith(".route.ts") || filePath.endsWith(".route.js");
      },
      options: {
        ...opts,
        apiTag: `users`,
        apiPrefix: `${opts.apiPrefix}/v1`
      }
    });

    diContainer.register({
      createUserCommandHandler: asClass(CreateUserCommandHandler).scoped()
    });

    fastify.commandBus.register(
      CreateUserCommand.type,
      fastify.diContainer.cradle.createUserCommandHandler
    );

    diContainer.register({
      getUserByEmailQueryHandler: asClass(GetUserByEmailQueryHandler).scoped(),
      getUsersByFilterQueryHandler: asClass(GetUsersByFilterQueryHandler).scoped()
    });

    fastify.queryBus.register(
      GetUserByEmailQuery.type,
      fastify.diContainer.cradle.getUserByEmailQueryHandler
    );

    fastify.queryBus.register(
      GetUsersByFilterQuery.type,
      fastify.diContainer.cradle.getUsersByFilterQueryHandler
    );

    fastify.ready(() => {
      //
    });
  },
  { dependencies: ["socket.io", "event-bus", "command-bus", "awilix", "auth"] }
);
