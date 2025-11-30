import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useSocketListener } from "@web/hooks/socket/use-socket-listener";
import type { ConversationsPage } from "@web/lib/tanstack/options/conversation/conversation";

interface UserStatusPayload {
  userId: string;
  status: "online" | "offline";
}

export const useUserStatusListener = (conversationId?: string) => {
  const queryClient = useQueryClient();

  useSocketListener<UserStatusPayload>("user:status:update", ({ userId, status }) => {
    // if (conversationId) {
    //   queryClient.setQueryData<GetParticipantsResponseDTO>(
    //     ["participants", conversationId],
    //     (data) =>
    //       data
    //         ? {
    //             ...data,
    //             payload: data.payload.map((p) => (p.userId === userId ? { ...p, status } : p))
    //           }
    //         : data
    //   );
    // }

    queryClient.setQueriesData<InfiniteData<ConversationsPage>>(
      { queryKey: ["conversations"] },
      (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => {
            if (!page) return page;

            return {
              ...page,
              data: page.data.map((conversation) => ({
                ...conversation,
                participants: conversation.participants.map((p) =>
                  p.userId === userId ? { ...p, status } : p
                )
              }))
            };
          })
        };
      }
    );
  });
};
