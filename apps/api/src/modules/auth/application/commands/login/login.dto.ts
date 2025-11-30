import { userSchema } from "@api/modules/user/domain/user.domain";
import { apiResponse } from "@api/shared/types/common";
import z from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" })
});

export type LoginDTO = z.infer<typeof loginSchema>;

export const authUserSchema = userSchema.pick({
  id: true,
  email: true,
  avatar: true,
  fullname: true
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const loginPayloadSchema = z.object({
  token: z.string(),
  user: authUserSchema
});

export const loginResponseSchema = apiResponse(loginPayloadSchema);

export type LoginResponseDTO = Required<z.infer<typeof loginResponseSchema>>;
