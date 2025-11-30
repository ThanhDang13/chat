import { hash } from "bcryptjs";

import { CommandHandler } from "@api/shared/commands/command-handler";
import { SignUpCommand } from "@api/modules/auth/application/commands/signup/signup.command";
import { CommandBus } from "@api/infra/plugins/command-bus";
import { CreateUserCommand } from "@api/modules/user/application/commands/create-user/create-user.command";

export class SignUpCommandHandler implements CommandHandler<SignUpCommand, string> {
  private readonly commandBus: CommandBus;

  constructor({ commandBus }: { commandBus: CommandBus }) {
    this.commandBus = commandBus;
  }

  async execute(command: SignUpCommand) {
    const userId = await this.commandBus.execute<CreateUserCommand, string>(
      new CreateUserCommand({
        ...command.payload,
        password: await hash(command.payload.password, 10)
      })
    );

    return userId;
    // const token = generateToken(userId);
  }
}
