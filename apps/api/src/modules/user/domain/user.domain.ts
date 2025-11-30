import { z } from "zod";

export const userSchema = z.object({
  email: z.string(),
  password: z.string(),
  id: z.string(),
  avatar: z.string().optional(),
  fullname: z.string(),
  thumbnail: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;
