import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversation-by-id/get-conversation-by-id.dto";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { ConversationsPage } from "@web/lib/tanstack/options/conversation/conversation";

export function addMessageToCache({
  queryClient,
  conversation
}: {
  queryClient: QueryClient;
  conversation: ConversationDTO;
}) {
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
      payload: {
        ...firstPage,
        data: [conversation, ...firstPage.data]
      }
    };

    return {
      ...old,
      pages: [updatedPage, ...old.pages.slice(1)]
    };
  });
}
