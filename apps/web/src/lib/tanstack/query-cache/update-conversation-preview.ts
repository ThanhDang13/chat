import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.dto";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { updateConversation } from "./update-conversation";
import { addConversationToCache } from "./add-conversation-to-cache";
import { ConversationsPage } from "@web/lib/tanstack/options/conversation/conversation";

export async function updateConversationPreview({
  queryClient,
  conversationId,
  buildPreview,
  fetchConversation
}: {
  queryClient: QueryClient;
  conversationId: string;
  buildPreview: (old?: ConversationDTO) => {
    lastMessage: ConversationDTO["lastMessage"];
    sortTimestamp: Date;
  };
  fetchConversation: (id: string) => Promise<ConversationDTO>;
}) {
  updateConversation(queryClient, conversationId, (old) => {
    return { ...old, ...buildPreview(old) };
  });

  const exists = queryClient
    .getQueryData<InfiniteData<ConversationsPage>>(["conversations"])
    ?.pages.some((p) => p.data.some((c) => c.id === conversationId));

  if (!exists) {
    try {
      const conversation = await fetchConversation(conversationId);
      addConversationToCache({ queryClient, conversation });
    } catch (err) {
      console.error("Failed to fetch conversation:", err);
    }
  }
}
