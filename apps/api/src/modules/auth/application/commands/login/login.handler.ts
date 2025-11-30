import { compare } from "bcryptjs";
import {
  LoginCommand,
  LoginCommandResult
} from "@api/modules/auth/application/commands/login/login.command";
import { CommandHandler } from "@api/shared/commands/command-handler";
import { generateToken } from "@api/utils/jwt";
import { QueryBus } from "@api/infra/plugins/query-bus";
import { GetUserByEmailQuery } from "@api/modules/user/application/queries/get-user-by-email/get-user-by-email.query";
import type { User } from "@api/modules/user/domain/user.domain";
import { UnauthorizedError } from "@api/shared/errors/unauthorized.error";

export class LoginCommandHandler implements CommandHandler<LoginCommand, LoginCommandResult> {
  private readonly queryBus: QueryBus;

  constructor({ queryBus }: { queryBus: QueryBus }) {
    this.queryBus = queryBus;
  }

  async execute(command: LoginCommand) {
    const user = await this.queryBus.execute<GetUserByEmailQuery, User>(
      new GetUserByEmailQuery({ email: command.payload.email })
    );

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await compare(command.payload.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }
    const token = generateToken(user.id);

    return { token, user };
  }
}
