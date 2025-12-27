import { Message, PendingMessage } from "@api/modules/message/domain/message.domain";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { MessagesPage } from "@web/lib/tanstack/options/chat/chat";

export function addMessageToCache({
  queryClient,
  conversationId,
  message
}: {
  queryClient: QueryClient;
  conversationId: string;
  message: Message | PendingMessage;
}) {
  queryClient.setQueryData<InfiniteData<MessagesPage>>(["messages", conversationId], (old) => {
    if (!old || old.pages.length === 0) return old;

    // Only add if last page is the newest
    const lastPageIndex = old.pages.length - 1;
    const lastPage = old.pages[lastPageIndex];

    if (!lastPage.hasNextPage) {
      const newPages = old.pages.map((page, i) =>
        i === lastPageIndex ? { ...page, data: [...page.data, message] } : page
      );
      return { ...old, pages: newPages };
    }

    return old;
  });
}
