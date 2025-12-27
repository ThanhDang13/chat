import { apiResponse } from "@api/shared/types/common";
import { z } from "zod";

export const changePasswordBodySchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export type ChangePasswordBodyDTO = z.infer<typeof changePasswordBodySchema>;

export const changePasswordResponseSchema = apiResponse(z.void());

export type ChangePasswordResponseDTO = Required<z.infer<typeof changePasswordResponseSchema>>;
