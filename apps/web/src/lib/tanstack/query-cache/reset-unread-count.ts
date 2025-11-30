import { QueryClient } from "@tanstack/react-query";
import { updateConversation } from "./update-conversation";

export function resetConversationUnreadCount(queryClient: QueryClient, conversationId: string) {
  updateConversation(queryClient, conversationId, (conversation) => ({
    ...conversation,
    unreadCount: 0
  }));
}
