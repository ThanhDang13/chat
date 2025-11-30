import { apiResponse } from "@api/shared/types/common";
import z from "zod";

export const participantDTOSchema = z.object({
  userId: z.uuid(),
  fullname: z.string(),
  avatar: z.string().nullable(),
  lastReadMessageId: z.uuid().nullable(),
  typing: z.boolean().optional().default(false)
});

export type ParticipantDTO = z.infer<typeof participantDTOSchema>;

export const getParticipantsResponseSchema = apiResponse(z.array(participantDTOSchema));

export type GetParticipantsResponseDTO = Required<z.infer<typeof getParticipantsResponseSchema>>;
