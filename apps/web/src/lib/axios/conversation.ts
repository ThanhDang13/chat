import type { GetConversationByIdResponseDTO } from "@api/modules/conversation/application/queries/get-conversation-by-id/get-conversation-by-id.dto";
import axiosInstance from "@web/lib/axios/instance";

export const getConversationById = async (conversationId: string) => {
  const response = await axiosInstance.get<GetConversationByIdResponseDTO>(
    `/conversations/${conversationId}`
  );
  return response.data.payload;
};
