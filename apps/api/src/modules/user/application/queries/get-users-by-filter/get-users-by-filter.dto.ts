import { apiResponse } from "@api/shared/types/common";
import { offsetPaginatedSchema } from "@api/shared/types/pagination";
import { z } from "zod";

export const userDTOSchema = z.object({
  id: z.string(),
  fullname: z.string(),
  email: z.email(),
  avatar: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type UserDTO = z.infer<typeof userDTOSchema>;

export const offsetPaginatedUsersSchema = offsetPaginatedSchema(userDTOSchema);

export const getUsersByFilterResponseSchema = apiResponse(offsetPaginatedUsersSchema);

export type GetUsersByfilterResponseDTO = Required<z.infer<typeof getUsersByFilterResponseSchema>>;
