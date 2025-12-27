import React, { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { Skeleton } from "@web/components/ui/skeleton";
import { AlertCircle, Inbox, Loader2, Search } from "lucide-react";
import { SearchUserItem } from "@web/components/conversation-panel/search-item";
import { createInfiniteSearchUsersQueryOptions } from "@web/lib/tanstack/options/search/search";
import { useNavigate } from "@tanstack/react-router";
import { createOpenPrivateConversationMutationOptions } from "@web/lib/tanstack/options/conversation/conversation";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle
} from "@web/components/ui/empty";
import { Spinner } from "@web/components/ui/spinner";

interface SearchUserListProps {
  keyword: string;
}

export const SearchUserList = React.memo(({ keyword }: SearchUserListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery(createInfiniteSearchUsersQueryOptions({ keyword: keyword, limit: 10 }));
  const navigate = useNavigate();

  const openPrivateConversation = useMutation({
    ...createOpenPrivateConversationMutationOptions(),
    onSuccess: (data) => {
      navigate({ to: "/chat/$id", params: { id: data.conversationId } });
    }
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    openPrivateConversation.mutate(userId);
  };

  const users = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const virtualizer = useVirtualizer({
    count: users.length,
    estimateSize: () => 56,
    getScrollElement: () => scrollAreaRef.current,
    overscan: 2
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (lastItem.index >= users.length - 1) {
      fetchNextPage();
    }
  }, [virtualItems, hasNextPage, isFetchingNextPage, fetchNextPage, users.length]);

  if (isLoading) {
    return <UsersSkeleton length={8} />;
  }

  if (isError) {
    return (
      <Empty className="h-full">
        <EmptyMedia variant="icon">
          <AlertCircle className="text-destructive h-6 w-6" />
        </EmptyMedia>
        <EmptyContent>
          <EmptyTitle>Failed to search users</EmptyTitle>
          <EmptyDescription>
            Something went wrong while searching your users. Please try again later.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  if ((!users || users.length === 0) && !isFetching) {
    return (
      <Empty className="h-full">
        <EmptyMedia variant="icon">
          <Search className="text-muted-foreground h-6 w-6" />
        </EmptyMedia>
        <EmptyContent>
          <EmptyTitle>No users found</EmptyTitle>
          <EmptyDescription>
            We couldn’t find any users matching your search. Try a different name or email.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="no-scrollbar h-full gap-1 overflow-y-auto p-2"
      onScroll={(e) => {
        const target = e.currentTarget;
        if (
          hasNextPage &&
          !isFetchingNextPage &&
          target.scrollTop + target.clientHeight >= target.scrollHeight - 100
        ) {
          fetchNextPage();
        }
      }}
    >
      <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualItems.map((vItem) => {
          const user = users[vItem.index];
          return (
            <div
              key={vItem.key}
              className="items-center gap-3 rounded-lg py-1 pr-1.5"
              style={{
                transform: `translateY(${vItem.start}px)`,
                height: `${vItem.size}px`,
                width: "100%",
                position: "absolute",
                top: 0,
                left: 0
              }}
            >
              <SearchUserItem
                user={user}
                onSelect={handleSelectUser}
                isSelected={selectedUserId === user.id}
                isPending={
                  openPrivateConversation.isPending && openPrivateConversation.variables === user.id
                }
              />
            </div>
          );
        })}
      </div>

      {isFetchingNextPage && <UsersSkeleton length={3} />}
    </ScrollArea>
  );
});

interface UsersSkeletonProps {
  length?: number;
}

const UsersSkeleton: React.FC<UsersSkeletonProps> = ({ length = 7 }) => {
  return (
    <div className="flex h-full flex-col gap-1 overflow-y-hidden p-2">
      {Array.from({ length: length }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="relative">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
