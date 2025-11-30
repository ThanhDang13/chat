import { apiResponse } from "@api/shared/types/common";
import { z } from "zod";

export const presignedUrlRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.string().default("uploads")
});

export const presignedUrlSchema = z.object({
  uploadUrl: z.url(),
  publicUrl: z.url(),
  key: z.string()
});

export type PresignedUrl = z.infer<typeof presignedUrlSchema>;

export const presignedUrlResponseSchema = apiResponse(presignedUrlSchema);

export type PresignedUrlResponseDTO = Required<z.infer<typeof presignedUrlResponseSchema>>;
