import { apiResponse } from "@api/shared/types/common";
import { z } from "zod";

export const updateConversationMuteStatusBodySchema = z.object({
  muted: z.boolean(),
});

export type UpdateConversationMuteStatusBodyDTO = z.infer<typeof updateConversationMuteStatusBodySchema>;

export const updateConversationMuteStatusResponseSchema = apiResponse(z.void());

export type UpdateConversationMuteStatusResponseDTO = Required<z.infer<typeof updateConversationMuteStatusResponseSchema>>;
