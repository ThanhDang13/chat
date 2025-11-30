import { Command } from "@api/shared/commands/command";

type CreateUserCommandPayload = {
  fullname: string;
  email: string;
  password: string;
};

export class CreateUserCommand implements Command {
  static readonly type = "CreateUserCommand";
  readonly type = "CreateUserCommand";
  constructor(public readonly payload: CreateUserCommandPayload) {}
}
