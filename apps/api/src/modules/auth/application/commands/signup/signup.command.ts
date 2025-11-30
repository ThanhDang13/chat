import { Command } from "@api/shared/commands/command";

type SignUpCommandPayload = {
  fullname: string;
  email: string;
  password: string;
};

export class SignUpCommand implements Command<string> {
  static readonly type = "SignUpCommand";
  readonly type = "SignUpCommand";

  constructor(public readonly payload: SignUpCommandPayload) {}
}
