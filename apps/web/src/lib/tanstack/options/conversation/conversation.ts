import { InfiniteData, UseInfiniteQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import axiosInstance from "@web/lib/axios/instance";
import { type CursorPagingDTO } from "@api/shared/types/pagination";
import { type GetConversationsResponseDTO } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.dto";
import { type OpenPrivateConversationResponseDTO } from "@api/modules/conversation/application/commands/open-private-conversation/open-private-conversation.dto";

export type ConversationsPage = GetConversationsResponseDTO["payload"];

const getInfiniteConversations = async (paging: CursorPagingDTO) => {
  const response = await axiosInstance.get<GetConversationsResponseDTO>("conversations", {
    params: { ...paging }
  });
  return response.data.payload;
};

export const createInfiniteConversationsQueryOptions = (
  opts: CursorPagingDTO
): UseInfiniteQueryOptions<
  GetConversationsResponseDTO["payload"],
  Error,
  InfiniteData<ConversationsPage>,
  unknown[],
  Date | undefined
> => {
  return {
    queryKey: ["conversations"],
    queryFn: ({ pageParam = undefined }) => {
      return getInfiniteConversations({
        type: opts.type,
        limit: opts.limit,
        cursor: pageParam
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: opts.cursor,
    refetchOnWindowFocus: false,
    staleTime: Infinity
  };
};

const openPrivateConversation = async (userId: string) => {
  const res = await axiosInstance.post<OpenPrivateConversationResponseDTO>(
    `/conversations/open/${userId}`
  );
  return res.data.payload;
};

export const createOpenPrivateConversationMutationOptions = (
  userId: string | null
): UseMutationOptions<
  OpenPrivateConversationResponseDTO["payload"],
  Error,
  string,
  OpenPrivateConversationResponseDTO["payload"]
> => {
  return {
    mutationKey: ["open, conversation", userId],
    mutationFn: (userId) => openPrivateConversation(userId)
  };
};
