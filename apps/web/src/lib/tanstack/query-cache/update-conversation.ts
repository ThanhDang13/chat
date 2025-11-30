import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversation-by-id/get-conversation-by-id.dto";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { ConversationsPage } from "@web/lib/tanstack/options/conversation/conversation";

export function updateConversation(
  queryClient: QueryClient,
  conversationId: string,
  updater: (conversation: ConversationDTO) => ConversationDTO
) {
  queryClient.setQueryData<InfiniteData<ConversationsPage>>(["conversations"], (old) => {
    if (!old) return old;

    const newPages = old.pages.map((page) => {
      if (!page) return page;

      const conversation = page.data.find((c) => c.id === conversationId);
      if (!conversation) return page;

      const others = page.data.filter((c) => c.id !== conversationId);
      return { ...page, data: [updater(conversation), ...others] };
    });

    return { ...old, pages: newPages };
  });
}
