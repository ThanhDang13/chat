import fp from "fastify-plugin";
import path from "path";
import AutoLoad from "@fastify/autoload";
import { ModuleOptions } from "@api/app";
import { diContainer } from "@fastify/awilix";
import { LoginCommandHandler } from "@api/modules/auth/application/commands/login/login.handler";
import { asClass } from "awilix";
import { LoginCommand } from "@api/modules/auth/application/commands/login/login.command";
import { SignUpCommandHandler } from "@api/modules/auth/application/commands/signup/signup.handler";
import { SignUpCommand } from "@api/modules/auth/application/commands/signup/signup.command";

export default fp(
  async (fastify, opts: ModuleOptions) => {
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
        apiTag: `auth`,
        apiPrefix: `${opts.apiPrefix}/v1`
      }
    });

    diContainer.register({
      loginCommandHandler: asClass(LoginCommandHandler).scoped(),
      signupCommandHandler: asClass(SignUpCommandHandler).scoped()
    });

    fastify.commandBus.register(LoginCommand.type, fastify.diContainer.cradle.loginCommandHandler);
    fastify.commandBus.register(
      SignUpCommand.type,
      fastify.diContainer.cradle.signupCommandHandler
    );

    fastify.ready(() => {
      //
    });
  },
  { dependencies: ["socket.io", "event-bus", "command-bus", "awilix", "auth"] }
);
