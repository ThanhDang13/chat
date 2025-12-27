import { DataBase } from "@api/infra/database";
import { GetUserByIdQuery } from "@api/modules/user/application/queries/get-user-by-id/get-user-by-id.query";
import { User } from "@api/modules/user/domain/user.domain";
import { QueryHandler } from "@api/shared/queries/query-handler";
import { Nullable } from "@api/shared/types/common";
export class GetUserByIdQueryHandler implements QueryHandler<GetUserByIdQuery, User> {
  private readonly db: DataBase;
  constructor({ db }: { db: DataBase }) {
    this.db = db;
  }

  async execute(query: GetUserByIdQuery): Promise<Nullable<User>> {
    const user = await this.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, query.payload.id)
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
