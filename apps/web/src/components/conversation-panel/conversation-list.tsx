import React, { useEffect, useRef } from "react";
import { Skeleton } from "@web/components/ui/skeleton";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createInfiniteConversationsQueryOptions } from "@web/lib/tanstack/options/conversation/conversation";
import { ConversationItem } from "@web/components/conversation-panel/conversation-item";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle
} from "@web/components/ui/empty";
import { AlertCircle, Inbox } from "lucide-react";
import { Spinner } from "@web/components/ui/spinner";

export const ConversationList = React.memo(({ standalone = false }: { standalone?: boolean }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, isFetching } =
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
    return <ConversationsSkeleton length={8} />;
  }

  if (isError) {
    return (
      <Empty className="h-full">
        <EmptyMedia variant="icon">
          <AlertCircle className="text-destructive h-6 w-6" />
        </EmptyMedia>
        <EmptyContent>
          <EmptyTitle>Failed to load conversations</EmptyTitle>
          <EmptyDescription>
            Something went wrong while fetching your conversations. Please try again later.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  if ((!conversations || conversations.length === 0) && !isFetching) {
    return (
      <Empty className="h-full">
        <EmptyMedia variant="icon">
          <Inbox className="text-muted-foreground h-6 w-6" />
        </EmptyMedia>
        <EmptyContent>
          <EmptyTitle>No Conversations</EmptyTitle>
          <EmptyDescription>
            You don’t have any conversations yet. Start a chat by searching for users above.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="h-full gap-1 overflow-y-auto p-2 pb-0">
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
      {isFetchingNextPage && <ConversationsSkeleton length={3} />}
    </ScrollArea>
  );
});

interface ConversationsSkeletonProps {
  length?: number;
}

const ConversationsSkeleton: React.FC<ConversationsSkeletonProps> = ({ length = 7 }) => {
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-hidden p-2">
      {Array.from({ length }).map((_, i) => (
        <div key={i} className="bg-muted/5 flex items-center gap-3 rounded-lg px-3 py-2.5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-3 w-1/2" />
          </div>

          {i % 4 === 0 && <Skeleton className="h-5 w-8 shrink-0 rounded-full" />}
        </div>
      ))}
    </div>
  );
};

ConversationList.displayName = "ConversationList";
