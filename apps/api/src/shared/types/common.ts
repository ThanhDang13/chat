import { z } from "zod";

export type Nullable<T> = T | null;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export const apiResponse = <T extends z.ZodTypeAny | undefined = undefined>(dataSchema?: T) => {
  return z.object({
    message: z.string(),
    payload: (dataSchema
      ? dataSchema.optional()
      : z.undefined().optional()) as T extends z.ZodTypeAny
      ? z.ZodOptional<T>
      : z.ZodOptional<z.ZodUndefined>
  });
};
