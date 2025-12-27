import { DataBase } from "@api/infra/database";
import { GetProfileQuery } from "./get-profile.query";
import { ProfileDTO } from "./get-profile.dto";
import { QueryHandler } from "@api/shared/queries/query-handler";
import { Nullable } from "@api/shared/types/common";
import { NotFoundError } from "@api/shared/errors/not-found.error";

export class GetProfileQueryHandler implements QueryHandler<
  GetProfileQuery,
  Nullable<ProfileDTO>
> {
  private readonly db: DataBase;

  constructor({ db }: { db: DataBase }) {
    this.db = db;
  }

  async execute(query: GetProfileQuery): Promise<Nullable<ProfileDTO>> {
    const user = await this.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, query.payload.id),
      columns: {
        id: true,
        fullname: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        preferences: {
          columns: {
            mutedAll: true,
            theme: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError(`User Profile Not Found With User ID ${query.payload.id}`);
    }

    return {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      mutedAll: user.preferences?.mutedAll ?? false,
      theme: user.preferences?.theme ?? "system",
    };
  }
}
