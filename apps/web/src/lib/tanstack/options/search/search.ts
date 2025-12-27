import { InfiniteData, UseInfiniteQueryOptions } from "@tanstack/react-query";
import axiosInstance from "@web/lib/axios/instance";
import { GetUsersByfilterResponseDTO } from "@api/modules/user/application/queries/get-users-by-filter/get-users-by-filter.dto";
import { sleep } from "@web/lib/utils";

export type UsersPage = GetUsersByfilterResponseDTO["payload"];

const getInfiniteSearchUsers = async ({
  keyword,
  page,
  limit
}: {
  keyword?: string;
  page: number;
  limit: number;
}) => {
  const response = await axiosInstance.get<GetUsersByfilterResponseDTO>("/users/search", {
    params: {
      keyword,
      page,
      limit,
      type: "offset",
      order: "desc",
      sort: "createdAt"
    }
  });

  return response.data.payload;
};

export const createInfiniteSearchUsersQueryOptions = ({
  keyword,
  limit = 20
}: {
  keyword?: string;
  limit?: number;
}): UseInfiniteQueryOptions<UsersPage, Error, InfiniteData<UsersPage>, unknown[], number> => {
  return {
    queryKey: ["search", keyword],
    queryFn: ({ pageParam = 1 }) => getInfiniteSearchUsers({ keyword, page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const { paging } = lastPage;
      const total = lastPage.total;
      const nextPage = paging.page * paging.limit < total ? paging.page + 1 : undefined;
      return nextPage;
    },
    initialPageParam: 1,
    enabled: !!keyword && keyword.length > 0,
    refetchOnWindowFocus: false,
    staleTime: Infinity
  };
};
