import type { LoginCommandHandler } from "@api/modules/auth/application/commands/login/login.handler";
import type { SignUpCommandHandler } from "@api/modules/auth/application/commands/signup/signup.handler";

declare module "@fastify/awilix" {
  interface Cradle {
    loginCommandHandler: LoginCommandHandler;
    signupCommandHandler: SignUpCommandHandler;
  }
}

// Treat this file as a module
export {};
