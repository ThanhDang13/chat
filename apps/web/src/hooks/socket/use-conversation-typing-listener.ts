import { useQueryClient } from "@tanstack/react-query";
import { useSocketListener } from "@web/hooks/socket/use-socket-listener";
import type { GetParticipantsResponseDTO } from "@api/modules/conversation/application/queries/get-participants/get-participants.dto";
import { useAuthStore } from "@web/stores/auth-store";

interface ConversationTypingPayload {
  conversationId: string;
  userId: string;
}

export function useConversationTypingListener(activeConversationId: string) {
  const queryClient = useQueryClient();
  const { me } = useAuthStore();

  useSocketListener<ConversationTypingPayload>(
    "conversation:typing:start",
    ({ conversationId, userId }) => {
      if (userId === me?.id || conversationId !== activeConversationId) return;

      queryClient.setQueryData<GetParticipantsResponseDTO["payload"]>(
        ["participants", conversationId],
        (data) =>
          data ? data.map((p) => (p.userId === userId ? { ...p, typing: true } : p)) : data
      );
    }
  );

  useSocketListener<ConversationTypingPayload>(
    "conversation:typing:stop",
    ({ conversationId, userId }) => {
      if (userId === me?.id || conversationId !== activeConversationId) return;

      queryClient.setQueryData<GetParticipantsResponseDTO["payload"]>(
        ["participants", conversationId],
        (data) =>
          data ? data.map((p) => (p.userId === userId ? { ...p, typing: false } : p)) : data
      );
    }
  );
}
