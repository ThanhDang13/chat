import z from "zod";

export const offsetPagingDTOSchema = z.object({
  type: z.literal("offset"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional().default("desc")
});

export type OffsetPagingDTO = z.infer<typeof offsetPagingDTOSchema>;

export const offsetPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    type: z.literal("offset"),
    data: z.array(itemSchema),
    total: z.coerce.number(),
    paging: offsetPagingDTOSchema
  });

export type OffsetPaginated<E> = z.infer<ReturnType<typeof offsetPaginatedSchema<z.ZodType<E>>>>;

export const cursorPagingDTOSchema = z.object({
  type: z.literal("cursor"),
  limit: z.coerce.number().optional().default(20),
  cursor: z.coerce.date().optional()
});

export type CursorPagingDTO = z.infer<typeof cursorPagingDTOSchema>;

export const cursorPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    type: z.literal("cursor"),
    data: z.array(itemSchema),
    hasNextPage: z.boolean().default(false),
    paging: cursorPagingDTOSchema,
    nextCursor: z.coerce.date().optional()
    // prevCursor: z.string().nullable().optional()
  });

export type CursorPaginated<E> = z.infer<ReturnType<typeof cursorPaginatedSchema<z.ZodType<E>>>>;

export const bidirectionalCursorPagingDTOSchema = z.object({
  type: z.literal("cursor"),
  limit: z.coerce.number().optional().default(20),
  after: z.uuidv7().optional(),
  before: z.uuidv7().optional()
});

export type BidirectionalCursorPagingDTO = z.infer<typeof bidirectionalCursorPagingDTOSchema>;

export const bidirectionalCursorPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    type: z.literal("cursor"),
    data: z.array(itemSchema),
    hasNextPage: z.boolean().default(false),
    hasPrevPage: z.boolean().default(false),
    paging: bidirectionalCursorPagingDTOSchema,
    nextCursor: z.uuidv7().optional(),
    prevCursor: z.uuidv7().optional()
  });

export type BidirectionalCursorPaginated<E> = z.infer<
  ReturnType<typeof bidirectionalCursorPaginatedSchema<z.ZodType<E>>>
>;

export type PagingDTO = OffsetPagingDTO | CursorPagingDTO | BidirectionalCursorPagingDTO;
export type Paginated<E> = OffsetPaginated<E> | CursorPaginated<E>;
