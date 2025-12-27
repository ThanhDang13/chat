import { apiResponse } from "@api/shared/types/common";
import { z } from "zod";

export const updateProfileBodySchema = z.object({
  fullname: z.string().optional(),
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  mutedAll: z.boolean().optional(),
  theme: z.string().optional(),
});

export type UpdateProfileBodyDTO = z.infer<typeof updateProfileBodySchema>;

export const updateProfileResponseSchema = apiResponse(z.void());

export type UpdateProfileResponseDTO = Required<z.infer<typeof updateProfileResponseSchema>>;
