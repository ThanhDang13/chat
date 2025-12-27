import { apiResponse } from "@api/shared/types/common";
import { z } from "zod";

export const profileDTOSchema = z.object({
  id: z.string(),
  fullname: z.string(),
  email: z.email(),
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  mutedAll: z.boolean().default(false),
  theme: z.string().default("system")
});

export type ProfileDTO = z.infer<typeof profileDTOSchema>;

export const getProfileResponseSchema = apiResponse(profileDTOSchema);

export type GetProfileResponseDTO = Required<z.infer<typeof getProfileResponseSchema>>;
