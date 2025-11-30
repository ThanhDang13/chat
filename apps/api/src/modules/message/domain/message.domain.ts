import z from "zod";

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  type: z.enum(["text", "image", "icon"]),
  timestamp: z.coerce.date()
});

export type Message = z.infer<typeof messageSchema>;

export type PendingMessage = Omit<Message, "id"> & {
  tempId: string;
  status: "pending" | "failed" | "delivered";
};
