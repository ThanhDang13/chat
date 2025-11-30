export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

export interface MessageRepository {
  insert(message: Omit<Message, "id" | "createdAt">): Promise<Message>;
}
