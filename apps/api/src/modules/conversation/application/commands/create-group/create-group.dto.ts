import { apiResponse } from "@api/shared/types/common";
import z from "zod";

export const createGroupConversationResponseSchema = apiResponse(
  z.object({
    id: z.uuid()
  })
);

export type CreateGroupConversationResponseDTO = Required<
  z.infer<typeof createGroupConversationResponseSchema>
>;
