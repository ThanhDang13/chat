import { DataBase } from "@api/infra/database";
import { conversationParticipants, users } from "@api/infra/database/schema";
import { ParticipantDTO } from "@api/modules/conversation/application/queries/get-participants/get-participants.dto";
import { GetParticipantsQuery } from "@api/modules/conversation/application/queries/get-participants/get-participants.query";
import { UnauthorizedError } from "@api/shared/errors/unauthorized.error";
import { QueryHandler } from "@api/shared/queries/query-handler";
import { and, eq, ne } from "drizzle-orm";

export class GetParticipantsQueryHandler
  implements QueryHandler<GetParticipantsQuery, ParticipantDTO[]>
{
  private readonly db: DataBase;
  constructor({ db }: { db: DataBase }) {
    this.db = db;
  }

  async execute(query: GetParticipantsQuery): Promise<ParticipantDTO[]> {
    const { conversationId, userId } = query.payload;

    const isMember = await this.db.query.conversationParticipants.findFirst({
      where: (cp, { eq, and }) => and(eq(cp.conversationId, conversationId), eq(cp.userId, userId))
    });

    if (!isMember) throw new UnauthorizedError("Not part of this conversation");

    // Fetch participants
    const participants = await this.db
      .select({
        userId: users.id,
        fullname: users.fullname,
        avatar: users.avatar,
        lastReadMessageId: conversationParticipants.lastReadMessageId
      })
      .from(conversationParticipants)
      .innerJoin(users, eq(conversationParticipants.userId, users.id))
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          ne(conversationParticipants.userId, userId)
        )
      );

    return participants.map((p) => ({ ...p, typing: false }));
  }
}
