import React, { useEffect, useRef } from "react";
import { ConversationItem } from "@web/components/chat/sidebar/conversation-item";
import { Skeleton } from "@web/components/ui/skeleton";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createInfiniteConversationsQueryOptions } from "@web/lib/tanstack/options/conversation/conversation";

export const ConversationList = React.memo(({ standalone = false }: { standalone?: boolean }) => {
  // const { data: conversations, isLoading, isError } = useConversations();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery(createInfiniteConversationsQueryOptions({ type: "cursor", limit: 10 }));

  const conversations = data?.pages.flatMap((page) => page.data ?? []);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const sortedConversations = React.useMemo(() => {
    return [...(conversations || [])].sort((a, b) => {
      const aTime = a.sortTimestamp ? new Date(a.sortTimestamp).getTime() : 0;
      const bTime = b.sortTimestamp ? new Date(b.sortTimestamp).getTime() : 0;
      return bTime - aTime;
    });
  }, [conversations]);

  const virtualizer = useVirtualizer({
    count: sortedConversations?.length ?? 0,
    estimateSize: () => 60,
    getScrollElement: () => scrollAreaRef.current
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (lastItem.index >= sortedConversations.length - 1) {
      fetchNextPage();
    }
  }, [virtualItems, hasNextPage, isFetchingNextPage, fetchNextPage, sortedConversations.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 overflow-y-auto p-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <div className="relative">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              {i % 3 === 0 && (
                <div className="bg-muted border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2" />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-3/4" />
                {i % 4 === 0 && <Skeleton className="h-5 w-8 shrink-0 rounded-full" />}
              </div>
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-destructive p-4 text-center">Failed to load conversations.</div>;
  }

  if (!conversations || conversations.length === 0) {
    return <div className="text-muted-foreground p-4 text-center">No conversations found.</div>;
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="no-scrollbar h-full gap-1 overflow-y-auto p-2">
      <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualItems.map((vItem) => {
          const conversation = sortedConversations[vItem.index];
          return (
            <div
              className="items-center gap-3 rounded-lg py-1 pr-1.5"
              style={{
                transform: `translateY(${vItem.start}px)`,
                height: `${vItem.size}px`,
                width: "100%",
                position: "absolute",
                top: 0,
                left: 0
              }}
              key={vItem.key}
              data-index={vItem.index}
            >
              <ConversationItem
                // key={conversation.id}
                conversation={conversation}
              ></ConversationItem>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
});

ConversationList.displayName = "ConversationList";
