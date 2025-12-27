import { CommandHandler } from "@api/shared/commands/command-handler";
import { DataBase } from "@api/infra/database";
import { users } from "@api/infra/database/schema";
import { ChangePasswordCommand } from "./change-password.command";
import { eq } from "drizzle-orm";
import * as argon2 from "argon2";
import { InvalidCredentialsError } from "@api/modules/auth/domain/auth.errors";

export class ChangePasswordCommandHandler implements CommandHandler<ChangePasswordCommand, void> {
  private readonly db: DataBase;

  constructor({ db }: { db: DataBase }) {
    this.db = db;
  }

  async execute(command: ChangePasswordCommand): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, command.payload.id)
    });

    if (!user) {
      throw new InvalidCredentialsError("User not found");
    }

    const passwordValid = await argon2.verify(user.password, command.payload.oldPassword);

    if (!passwordValid) {
      throw new InvalidCredentialsError("Old password is incorrect");
    }

    const hashedPassword = await argon2.hash(command.payload.newPassword);

    await this.db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, command.payload.id));
  }
}
