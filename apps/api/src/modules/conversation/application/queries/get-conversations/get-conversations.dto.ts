import { apiResponse } from "@api/shared/types/common";
import { cursorPaginatedSchema } from "@api/shared/types/pagination";
import { z } from "zod";

export const conversationDTOSchema = z.object({
  id: z.string(),
  isGroup: z.boolean(),
  name: z.string().nullable(),
  avatar: z.string().nullable(),
  participants: z.array(
    z.object({
      userId: z.string(),
      status: z.enum(["online", "offline"])
    })
  ),
  lastMessage: z
    .object({
      id: z.string(),
      senderId: z.string(),
      content: z.string(),
      type: z.enum(["text", "image", "icon"]),
      timestamp: z.coerce.date()
    })
    .nullable(),
  unreadCount: z.coerce.number().default(0),
  sortTimestamp: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export const cursorPaginatedConversationsSchema = cursorPaginatedSchema(conversationDTOSchema);

export const getConversationsResponseSchema = apiResponse(cursorPaginatedConversationsSchema);

export type ConversationDTO = z.infer<typeof conversationDTOSchema>;

export type GetConversationsResponseDTO = Required<z.infer<typeof getConversationsResponseSchema>>;
