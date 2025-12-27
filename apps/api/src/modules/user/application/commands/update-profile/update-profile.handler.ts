import { CommandHandler } from "@api/shared/commands/command-handler";
import { DataBase } from "@api/infra/database";
import { userPreferences, users } from "@api/infra/database/schema";
import { UpdateProfileCommand } from "./update-profile.command";
import { and, eq } from "drizzle-orm";

export class UpdateProfileCommandHandler implements CommandHandler<UpdateProfileCommand, void> {
  private readonly db: DataBase;

  constructor({ db }: { db: DataBase }) {
    this.db = db;
  }

  async execute(command: UpdateProfileCommand): Promise<void> {
    await this.db
      .update(users)
      .set({
        fullname: command.payload.fullname,
        avatar: command.payload.avatar,
        bio: command.payload.bio,
        updatedAt: new Date()
      })
      .where(eq(users.id, command.payload.id));

    const { mutedAll, theme, id: userId } = command.payload;

    if (mutedAll !== undefined || theme !== undefined) {
      const updated = await this.db
        .update(userPreferences)
        .set({
          mutedAll,
          theme
        })
        .where(eq(userPreferences.userId, userId))
        .returning({ id: userPreferences.userId });

      if (updated.length === 0) {
        await this.db.insert(userPreferences).values({
          userId,
          mutedAll: mutedAll ?? false,
          theme: theme ?? "system"
        });
      }
    }
  }
}
