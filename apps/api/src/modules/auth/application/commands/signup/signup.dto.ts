import { apiResponse } from "@api/shared/types/common";
import z from "zod";

export const signupSchema = z
  .object({
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    retypePassword: z.string().min(6, "Retype your password"),
    fullname: z.string().min(1, "Fullname is required")
  })
  .refine((data) => data.password === data.retypePassword, {
    message: "Passwords do not match",
    path: ["retypePassword"]
  });

export type SignupDTO = z.infer<typeof signupSchema>;

export const signupResponseSchema = apiResponse();
export type SignupResponse = z.infer<typeof signupResponseSchema>;
