import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversation-by-id/get-conversation-by-id.dto";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { ConversationsPage } from "@web/lib/tanstack/options/conversation/conversation";

export function addConversationToCache({
  queryClient,
  conversation
}: {
  queryClient: QueryClient;
  conversation: ConversationDTO;
}) {
  queryClient.setQueryData<InfiniteData<ConversationsPage>>(["conversations"], (old) => {
    if (!old || !Array.isArray(old.pages) || old.pages.length === 0) {
      return {
        pages: [
          {
            type: "cursor",
            data: [conversation],
            hasNextPage: true,
            paging: {
              type: "cursor",
              limit: 1,
              cursor: undefined
            }
          }
        ],
        pageParams: [undefined]
      };
    }

    const firstPage = old.pages[0];
    const firstPageData = Array.isArray(firstPage.data) ? firstPage.data : [];

    return {
      ...old,
      pages: [{ ...firstPage, data: [conversation, ...firstPageData] }, ...old.pages.slice(1)]
    };
  });
}
