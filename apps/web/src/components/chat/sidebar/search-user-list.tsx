import React, { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { Skeleton } from "@web/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { SearchUserItem } from "@web/components/chat/sidebar/search-item";
import { createInfiniteSearchUsersQueryOptions } from "@web/lib/tanstack/options/search/search";
import { useNavigate } from "@tanstack/react-router";
import { createOpenPrivateConversationMutationOptions } from "@web/lib/tanstack/options/conversation/conversation";

interface SearchUserListProps {
  keyword: string;
}

export const SearchUserList = React.memo(({ keyword }: SearchUserListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery(createInfiniteSearchUsersQueryOptions({ keyword: keyword, limit: 15 }));
  const navigate = useNavigate();

  const createConversation = useMutation({
    ...createOpenPrivateConversationMutationOptions(selectedUserId),
    onSuccess: (data) => {
      navigate({ to: "/chat/$id", params: { id: data.conversationId } });
    }
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    createConversation.mutate(userId);
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
    return (
      <div className="flex flex-col gap-1 overflow-y-auto p-2">
        {Array.from({ length: 8 }).map((_, i) => (
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
  }

  if (isError) {
    return <div className="text-destructive p-4 text-center">Failed to load users.</div>;
  }

  if (users.length === 0 && !isFetching) {
    return <div className="text-muted-foreground p-4 text-center">No users found.</div>;
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
                isPending={createConversation.isPending && createConversation.variables === user.id}
              />
            </div>
          );
        })}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center p-2">
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        </div>
      )}
    </ScrollArea>
  );
});

SearchUserList.displayName = "SearchUserList";
