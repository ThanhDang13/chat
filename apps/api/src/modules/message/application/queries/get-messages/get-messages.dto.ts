import { messageSchema } from "@api/modules/message/domain/message.domain";
import { apiResponse } from "@api/shared/types/common";
import { bidirectionalCursorPaginatedSchema } from "@api/shared/types/pagination";
import z from "zod";

export const bidirectionalCursorPaginatedMessagesSchema =
  bidirectionalCursorPaginatedSchema(messageSchema);

export const getMessagesResponseSchema = apiResponse(bidirectionalCursorPaginatedMessagesSchema);

export type GetMessagesResponseDTO = Required<z.infer<typeof getMessagesResponseSchema>>;
