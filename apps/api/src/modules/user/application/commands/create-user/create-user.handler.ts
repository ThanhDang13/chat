import { CommandHandler } from "@api/shared/commands/command-handler";
import { DataBase } from "@api/infra/database";
import { users } from "@api/infra/database/schema";
import { CreateUserCommand } from "@api/modules/user/application/commands/create-user/create-user.command";
import { EmailAlreadyExistsError } from "@api/modules/user/domain/user.errors";

export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, string> {
  private readonly db: DataBase;
  constructor({ db }: { db: DataBase }) {
    this.db = db;
  }

  async execute(command: CreateUserCommand): Promise<string> {
    const existing = await this.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, command.payload.email)
    });

    if (existing) {
      throw new EmailAlreadyExistsError(command.payload.email);
    }

    const user = await this.db.insert(users).values(command.payload).returning({ id: users.id });

    return user[0].id;
  }
}
