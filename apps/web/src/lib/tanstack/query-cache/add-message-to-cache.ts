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
  queryClient.setQueryData<InfiniteData<MessagesPage>>(["messages", conversationId], (old) =>
    old
      ? {
          ...old,
          pages: old.pages.map((page, i) =>
            i === 0
              ? {
                  ...page,
                  data: [message, ...page.data]
                }
              : page
          )
        }
      : old
  );
}
