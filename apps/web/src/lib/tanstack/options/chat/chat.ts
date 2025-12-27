import { InfiniteData, UseInfiniteQueryOptions } from "@tanstack/react-query";
import axiosInstance from "@web/lib/axios/instance";
import {
  type BidirectionalCursorPagingDTO,
  type CursorPagingDTO
} from "@api/shared/types/pagination";
import { type GetMessagesResponseDTO } from "@api/modules/message/application/queries/get-messages/get-messages.dto";
import { Message, PendingMessage } from "@api/modules/message/domain/message.domain";

export type MessagesPage = Omit<GetMessagesResponseDTO["payload"], "data"> & {
  data: (Message | PendingMessage)[];
};

const getInfiniteMessagesByConversationId = async (
  id: string,
  paging: BidirectionalCursorPagingDTO
) => {
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
  opts: Pick<BidirectionalCursorPagingDTO, "before" | "limit">;
}): UseInfiniteQueryOptions<
  GetMessagesResponseDTO["payload"],
  Error,
  InfiniteData<MessagesPage>,
  unknown[],
  { cursor: string | undefined; direction: "previous" | "next" }
> => {
  return {
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) => {
      if (pageParam.direction === "next") {
        return getInfiniteMessagesByConversationId(conversationId, {
          type: "cursor",
          ...opts,
          before: undefined,
          after: pageParam.cursor
        });
      }

      return getInfiniteMessagesByConversationId(conversationId, {
        type: "cursor",
        ...opts,
        after: undefined,
        before: pageParam.cursor
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage
        ? {
            cursor: lastPage.nextCursor,
            direction: "next"
          }
        : null,

    getPreviousPageParam: (firstPage) =>
      firstPage.hasPrevPage
        ? {
            cursor: firstPage.prevCursor,
            direction: "previous"
          }
        : null,
    initialPageParam: { cursor: opts.before ?? undefined, direction: "previous" },
    refetchOnWindowFocus: false,
    staleTime: Infinity
  };
};
