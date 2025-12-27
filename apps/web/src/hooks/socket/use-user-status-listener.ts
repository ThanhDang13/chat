import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversation-by-id/get-conversation-by-id.dto";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useSocketListener } from "@web/hooks/socket/use-socket-listener";
import type { ConversationsPage } from "@web/lib/tanstack/options/conversation/conversation";
import { updateConversation } from "@web/lib/tanstack/query-cache/update-conversation";

interface UserStatusPayload {
  userId: string;
  status: "online" | "offline";
}

export const useUserStatusListener = () => {
  const queryClient = useQueryClient();

  useSocketListener<UserStatusPayload>("user:status:update", ({ userId, status }) => {
    // queryClient.setQueriesData<InfiniteData<ConversationsPage>>(
    //   { queryKey: ["conversations"] },
    //   (old) => {
    //     if (!old) return old;

    //     return {
    //       ...old,
    //       pages: old.pages.map((page) => {
    //         if (!page) return page;

    //         return {
    //           ...page,
    //           data: page.data.map((conversation) => ({
    //             ...conversation,
    //             participants: conversation.participants.map((p) =>
    //               p.userId === userId ? { ...p, status } : p
    //             )
    //           }))
    //         };
    //       })
    //     };
    //   }
    // );

    const cachedConversations = queryClient.getQueryData<InfiniteData<ConversationsPage>>([
      "conversations"
    ]);

    if (cachedConversations) {
      cachedConversations.pages.forEach((page) => {
        page.data.forEach((conversation) => {
          // 3️⃣ Update each conversation using your util
          updateConversation(queryClient, conversation.id, (conv) => ({
            ...conv,
            participants: conv.participants.map((p) => (p.userId === userId ? { ...p, status } : p))
          }));
        });
      });
    }

    // queryClient.setQueriesData<ConversationDTO>({ queryKey: ["conversation"] }, (old) => {
    //   if (!old) return old;

    //   return {
    //     ...old,
    //     participants: old.participants.map((p) => (p.userId === userId ? { ...p, status } : p))
    //   };
    // });
  });
};
