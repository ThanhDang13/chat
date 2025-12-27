import { Message } from "@api/modules/message/domain/message.domain";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { useSocketListener } from "@web/hooks/socket/use-socket-listener";
import { useSound } from "@web/hooks/use-sound";
import {
  ConversationsPage,
  getConversationById
} from "@web/lib/tanstack/options/conversation/conversation";
import { addConversationToCache } from "@web/lib/tanstack/query-cache/add-conversation-to-cache";
import { addMessageToCache } from "@web/lib/tanstack/query-cache/add-message-to-cache";
import { updateConversation } from "@web/lib/tanstack/query-cache/update-conversation";
import { useAuthStore } from "@web/stores/auth-store";

export function useMessageListener() {
  const queryClient = useQueryClient();
  const me = useAuthStore((s) => s.me);
  const { play, canPlay } = useSound("/sounds/ding.mp3");

  useSocketListener("conversation:message:created", async (message: Message) => {
    if (message.senderId === me?.id) return;
    const conversationId = message.conversationId;

    addMessageToCache({ queryClient, conversationId, message });

    let isMuted = false;

    updateConversation(queryClient, conversationId, (conversation) => {
      isMuted = conversation.isMuted;

      return {
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
    });

    const exists = queryClient
      .getQueryData<InfiniteData<ConversationsPage>>(["conversations"])
      ?.pages.some((p) => p.data.some((c) => c.id === conversationId));

    if (!exists) {
      try {
        const conversation = await getConversationById(conversationId);
        isMuted = conversation.isMuted;

        addConversationToCache({ queryClient, conversation });
      } catch (err) {
        console.error("Failed to fetch conversation:", err);
      }
    }

    if (canPlay && !isMuted) play();
  });
}
