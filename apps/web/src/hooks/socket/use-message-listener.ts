import { Message } from "@api/modules/message/domain/message.domain";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { useSocketListener } from "@web/hooks/socket/use-socket-listener";
import { getConversationById } from "@web/lib/axios/conversation";
import { ConversationsPage } from "@web/lib/tanstack/options/conversation/conversation";
import { addMessageToCache } from "@web/lib/tanstack/query-cache/add-message-to-cache";
import { useAuthStore } from "@web/stores/auth-store";

export function useMessageListener() {
  const queryClient = useQueryClient();
  const me = useAuthStore((s) => s.me);

  useSocketListener("conversation:message:created", async (message: Message) => {
    if (message.senderId === me?.id) return;
    const conversationId = message.conversationId;

    addMessageToCache({ queryClient, conversationId, message });

    let found = false;

    queryClient.setQueryData<InfiniteData<ConversationsPage>>(["conversations"], (old) => {
      if (!old) return old;

      const newPages = old.pages.map((page) => {
        if (!page) return page;

        const conversation = page.data.find((c) => c.id === conversationId);

        if (!conversation) return page;

        found = true;

        const others = page.data.filter((c) => c.id !== conversationId);
        const updatedConversation = {
          ...conversation,
          lastMessage: {
            id: message.id,
            senderId: message.senderId,
            content: message.content,
            type: message.type,
            timestamp: message.timestamp
          },
          sortTimestamp: message.timestamp,
          unreadCount: Number(conversation.unreadCount ?? 0) + 1
        };

        return {
          ...page,
          data: [updatedConversation, ...others]
        };
      });

      return { ...old, pages: newPages };
    });

    if (!found) {
      try {
        const conversation = await getConversationById(conversationId);

        queryClient.setQueryData<InfiniteData<ConversationsPage>>(["conversations"], (old) => {
          if (!old)
            return {
              pages: [
                {
                  type: "cursor",
                  data: [conversation],
                  hasNextPage: true,
                  paging: {
                    type: "cursor",
                    limit: 1
                  }
                }
              ],
              pageParams: [undefined]
            };

          const firstPage = old.pages[0];
          const updatedPage = {
            ...firstPage,
            data: [conversation, ...firstPage.data]
          };

          return {
            ...old,
            pages: [updatedPage, ...old.pages.slice(1)]
          };
        });
      } catch (err) {
        console.error("Failed to fetch conversation:", err);
      }
    }
  });
}
