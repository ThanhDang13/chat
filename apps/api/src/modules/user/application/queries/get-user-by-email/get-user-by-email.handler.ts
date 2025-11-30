import type { DataBase } from "@api/infra/database";

import { GetUserByEmailQuery } from "@api/modules/user/application/queries/get-user-by-email/get-user-by-email.query";
import type { User } from "@api/modules/user/domain/user.domain";

import type { QueryHandler } from "@api/shared/queries/query-handler";
import type { Nullable } from "@api/shared/types/common";

export class GetUserByEmailQueryHandler implements QueryHandler<GetUserByEmailQuery, unknown> {
  private readonly db: DataBase;
  constructor({ db }: { db: DataBase }) {
    this.db = db;
  }

  async execute(query: GetUserByEmailQuery): Promise<Nullable<User>> {
    const user = await this.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, query.payload.email)
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
