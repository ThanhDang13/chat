import { apiResponse } from "@api/shared/types/common";
import z, { string } from "zod";

export const conversationDTOSchema = z.object({
  id: z.string(),
  isGroup: z.boolean(),
  name: z.string().nullable(),
  avatar: z.string().nullable(),
  participants: z.array(
    z.object({
      userId: z.string(),
      status: z.enum(["online", "offline"]),
      username: z.string()
    })
  ),
  bio: z.string().nullable(),
  isMuted: z.boolean().default(false),
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

export type ConversationDTO = z.infer<typeof conversationDTOSchema>;

export const getConversationByIdResponseSchema = apiResponse(conversationDTOSchema);

export type GetConversationByIdResponseDTO = Required<
  z.infer<typeof getConversationByIdResponseSchema>
>;
