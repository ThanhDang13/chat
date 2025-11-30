// import { basePropsSchema } from "@api/domain/models/BaseEntity";
// import { userPropsSchema } from "@api/domain/models/User";
// import z from "zod";

// export const userSchema = z.object({
//   ...userPropsSchema.shape,
//   ...basePropsSchema.shape
// });

// export const userParamsSchema = userSchema.pick({
//   id: true
// });

// export const userQuerySchema = z.object({
//   withAddresses: z.enum(["true", "false"]).optional()
// });

// export const createUserSchema = userSchema.pick({
//   email: true,
//   password: true,
//   fullname: true,
//   role: true,
//   status: true
// });

// export const signupSchema = userSchema.pick({
//   email: true,
//   password: true,
//   fullname: true
// });

// export const loginSchema = userSchema.pick({
//   email: true,
//   password: true
// });

// export const userConditionSchema = userSchema
//   .omit({ password: true, createdAt: true, updatedAt: true })
//   .partial();

// export type UserConditionDTO = z.infer<typeof userConditionSchema>;
