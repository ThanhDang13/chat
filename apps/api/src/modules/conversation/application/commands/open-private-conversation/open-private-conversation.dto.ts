import { apiResponse } from "@api/shared/types/common";
import z from "zod";

export const openPrivateConversationResponseSchema = apiResponse(
  z.object({
    conversationId: z.uuid(),
    created: z.boolean()
  })
);

export type OpenPrivateConversationResponseDTO = Required<
  z.infer<typeof openPrivateConversationResponseSchema>
>;
