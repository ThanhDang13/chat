import { AuthUser } from "@api/modules/auth/application/commands/login/login.dto";
import { Command } from "@api/shared/commands/command";

type LoginCommandPayload = {
  email: string;
  password: string;
};

export type LoginCommandResult = {
  token: string;
  user: AuthUser;
};

export class LoginCommand implements Command<LoginCommandResult, LoginCommandPayload> {
  static readonly type = "LoginCommand";
  readonly type = "LoginCommand";

  constructor(public readonly payload: LoginCommandPayload) {}
}
