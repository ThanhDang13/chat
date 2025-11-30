import { UseQueryOptions } from "@tanstack/react-query";
import axiosInstance from "@web/lib/axios/instance";
import { type GetParticipantsResponseDTO } from "@api/modules/conversation/application/queries/get-participants/get-participants.dto";

const getParticipantsByConversationId = async ({ id }: { id: string }) => {
  const response = await axiosInstance.get<GetParticipantsResponseDTO>(
    `conversations/${id}/participants`
  );
  return response.data.payload;
};

export const createParticipantsQueryOptions = ({
  conversationId
}: {
  conversationId: string;
}): UseQueryOptions<
  GetParticipantsResponseDTO["payload"],
  Error,
  GetParticipantsResponseDTO["payload"],
  unknown[]
> => ({
  queryKey: ["participants", conversationId],
  queryFn: () => getParticipantsByConversationId({ id: conversationId }),
  staleTime: Infinity
});
