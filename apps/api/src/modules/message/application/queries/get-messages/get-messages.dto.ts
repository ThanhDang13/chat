import { messageSchema } from "@api/modules/message/domain/message.domain";
import { apiResponse } from "@api/shared/types/common";
import { cursorPaginatedSchema } from "@api/shared/types/pagination";
import z from "zod";

export const cursorPaginatedMessagesSchema = cursorPaginatedSchema(messageSchema);

export const getMessagesResponseSchema = apiResponse(cursorPaginatedMessagesSchema);

export type GetMessagesResponseDTO = Required<z.infer<typeof getMessagesResponseSchema>>;
