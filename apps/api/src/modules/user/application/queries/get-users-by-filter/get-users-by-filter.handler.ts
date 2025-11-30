import type { DataBase } from "@api/infra/database";
import { users } from "@api/infra/database/schema";
import { UserDTO } from "./get-users-by-filter.dto";
import { GetUsersByFilterQuery } from "./get-users-by-filter.query";
import { QueryHandler } from "@api/shared/queries/query-handler";
import { OffsetPagingDTO, Paginated } from "@api/shared/types/pagination";
import { and, ilike, ne, or, sql } from "drizzle-orm";

export class GetUsersByFilterQueryHandler
  implements QueryHandler<GetUsersByFilterQuery, Paginated<UserDTO>>
{
  private readonly db: DataBase;

  constructor({ db }: { db: DataBase }) {
    this.db = db;
  }

  async execute(query: GetUsersByFilterQuery): Promise<Paginated<UserDTO>> {
    const { currentUserId, keyword, paging } = query.payload;
    const { page, limit, order, sort } = paging as OffsetPagingDTO;
    const offset = (page - 1) * limit;

    const conditions = [ne(users.id, currentUserId)];
    if (keyword) {
      conditions.push(
        or(ilike(users.fullname, `%${keyword}%`), ilike(users.email, `%${keyword}%`))
      );
    }

    const sortField =
      sort === "email" ? users.email : sort === "createdAt" ? users.createdAt : users.fullname;

    const result = await this.db.query.users.findMany({
      where: and(...conditions),
      orderBy: (u, { asc, desc }) => (order === "asc" ? [asc(sortField)] : [desc(sortField)]),
      offset,
      limit,
      columns: {
        id: true,
        fullname: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const totalResult = await this.db
      .select({
        total: sql<number>`COUNT(*)`
      })
      .from(users)
      .where(and(...conditions));

    const total = totalResult[0]?.total ?? 0;

    const items: UserDTO[] = result.map((u) => ({
      id: u.id,
      fullname: u.fullname,
      email: u.email,
      avatar: u.avatar,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }));

    return {
      type: "offset",
      paging: { type: "offset", page, limit, order, sort },
      data: items,
      total
    };
  }
}
