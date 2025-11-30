import type { GetParticipantsResponseDTO } from "@api/modules/conversation/application/queries/get-participants/get-participants.dto";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketListener } from "@web/hooks/socket/use-socket-listener";

interface ConversationReadPayload {
  userId: string;
  lastReadMessageId: string;
}

export const useConversationReadListener = (conversationId: string) => {
  const queryClient = useQueryClient();

  useSocketListener<ConversationReadPayload>(
    "conversation:read:update",
    ({ userId, lastReadMessageId }) => {
      queryClient.setQueryData<GetParticipantsResponseDTO["payload"]>(
        ["participants", conversationId],
        (data) =>
          data
            ? data.map((p) =>
                p.userId === userId ? { ...p, lastReadMessageId: lastReadMessageId } : p
              )
            : data
      );
    }
  );
};
