import { InfiniteData, UseInfiniteQueryOptions } from "@tanstack/react-query";
import axiosInstance from "@web/lib/axios/instance";
import { type CursorPagingDTO } from "@api/shared/types/pagination";
import { type GetMessagesResponseDTO } from "@api/modules/message/application/queries/get-messages/get-messages.dto";
import { Message, PendingMessage } from "@api/modules/message/domain/message.domain";

export type MessagesPage = Omit<GetMessagesResponseDTO["payload"], "data"> & {
  data: (Message | PendingMessage)[];
};

const getInfiniteMessagesByConversationId = async (id: string, paging: CursorPagingDTO) => {
  const response = await axiosInstance.get<GetMessagesResponseDTO>(
    `/conversations/${id}/messages`,
    { params: paging }
  );
  return response.data.payload;
};

export const createInfiniteMessagesQueryOptions = ({
  conversationId,
  opts
}: {
  conversationId: string;
  opts: CursorPagingDTO;
}): UseInfiniteQueryOptions<
  GetMessagesResponseDTO["payload"],
  Error,
  InfiniteData<MessagesPage>,
  unknown[],
  Date | undefined
> => {
  return {
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam = undefined }) => {
      return getInfiniteMessagesByConversationId(conversationId, {
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
