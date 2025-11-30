import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MessageBubble } from "@web/components/chat/message-bubble";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { useAutoScroll } from "@web/hooks/use-auto-scroll";
import { createInfiniteMessagesQueryOptions } from "@web/lib/tanstack/options/chat/chat";
import { formatDividerTime, getMessageGroupInfo } from "@web/lib/message";
import { createParticipantsQueryOptions } from "@web/lib/tanstack/options/conversation/participant";
import { useAuthStore } from "@web/stores/auth-store";
import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@web/components/ui/skeleton";
import { useSocketStore } from "@web/stores/socket-store";
import { Message } from "@api/modules/message/domain/message.domain";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { useConversationReadListener } from "@web/hooks/socket/use-conversation-read-listener";
import { resetConversationUnreadCount } from "@web/lib/tanstack/query-cache/reset-unread-count";

interface MessageListProps {
  conversationId: string;
  isGroupChat: boolean;
}

export function MessageList({ conversationId, isGroupChat }: MessageListProps) {
  const { me } = useAuthStore();
  const socket = useSocketStore((s) => s.socket);
  const queryClient = useQueryClient();
  const {
    data: messagesPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    ...createInfiniteMessagesQueryOptions({
      conversationId,
      opts: { type: "cursor", limit: 30 }
    }),
    enabled: !!conversationId
  });

  const { data: participantsData } = useQuery({
    ...createParticipantsQueryOptions({ conversationId }),
    enabled: !!conversationId
  });

  const messages = useMemo(() => {
    if (!messagesPages?.pages) return [];

    return messagesPages.pages.flatMap((page) => page.data ?? []).reverse();
  }, [messagesPages]);
  const participants = useMemo(
    () => (Array.isArray(participantsData) ? participantsData : []),
    [participantsData]
  );
  const lastEmittedId = useRef<string | null>(null);

  const typingUsers = useMemo(() => participants.filter((p) => p.typing), [participants]);

  const topAnchorRef = useRef<HTMLDivElement>(null);

  const {
    containerRef,
    bottomAnchorRef,
    scrollToBottomAnchor,
    scrollToBottom,
    handleScroll,
    handleTouchStart
  } = useAutoScroll([messages]);

  const virtualizer = useVirtualizer({
    count: messages?.length ?? 0,
    estimateSize: () => 95,
    getScrollElement: () => containerRef.current
  });

  const virtualItems = virtualizer.getVirtualItems();

  useConversationReadListener(conversationId);

  useEffect(() => {
    if (virtualItems.length === 0) return;

    const lastItem = virtualItems[virtualItems.length - 1];

    if (lastItem.index === messages.length - 1) {
      scrollToBottomAnchor({ behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, typingUsers]);

  useEffect(() => {
    if (!socket || messages.length === 0) return;

    if (virtualItems.length === 0) return;

    const newestPage = messagesPages?.pages[0];
    if (!newestPage) return;

    const lastMessage = [...newestPage.data].find((m): m is Message => "id" in m && !!m.id);

    if (!lastMessage) return;

    const lastVisible = virtualItems[virtualItems.length - 1];

    const isLastMessageVisible = lastVisible.index === messages.length - 1;

    if (isLastMessageVisible && lastEmittedId.current !== lastMessage.id) {
      lastEmittedId.current = lastMessage.id;

      socket.emit("conversation:read:update", {
        conversationId,
        lastReadMessageId: lastMessage.id
      });

      resetConversationUnreadCount(queryClient, conversationId);

      console.log("[read:update]", lastMessage.id);
    }
  }, [virtualItems, messages, conversationId, socket, messagesPages]);

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    const container = containerRef.current;
    const anchor = topAnchorRef.current;
    if (!container || !anchor) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        if (!hasNextPage || isFetchingNextPage) return;

        const result = await fetchNextPage();

        const index = result.data?.pages[result.data.pages.length - 1].data.length ?? 0;
        requestAnimationFrame(() => {
          console.log("Last page length:", index);
          virtualizer.scrollToIndex(index, { align: "start" });
        });
      },
      {
        root: container,
        threshold: 0.1
      }
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    containerRef,
    virtualizer,
    messagesPages?.pages
  ]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4">
        {/* First message group with time divider */}
        <div className="px-4">
          <div className="my-3 flex justify-center">
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <div>
            <div className="group mb-1 flex items-end gap-3">
              <span className="ring-background relative flex size-8 shrink-0 overflow-hidden rounded-full shadow-sm ring-2">
                <Skeleton className="aspect-square size-full rounded-full" />
              </span>
              <div className="flex flex-col">
                {/* <Skeleton className="mb-1 h-4 w-16" /> */}
                <div className="border-border bg-card mr-12 flex max-w-sm flex-col rounded-2xl rounded-bl-md border px-4 py-3 shadow-sm">
                  <Skeleton className="mb-2 h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right-aligned message (current user) */}
        <div className="px-4">
          <div>
            <div className="group mb-1 flex flex-row-reverse items-end gap-3">
              <div className="flex flex-col">
                <div className="bg-primary/10 ml-12 flex max-w-sm flex-col rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                  <Skeleton className="mb-2 h-4 w-64" />
                  <Skeleton className="h-3 w-26 self-end" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left-aligned message with avatar */}
        <div className="px-4">
          <div>
            <div className="group mb-1 flex items-end gap-3">
              <span className="ring-background relative flex size-8 shrink-0 overflow-hidden rounded-full shadow-sm ring-2">
                <Skeleton className="aspect-square size-full rounded-full" />
              </span>
              <div className="flex flex-col">
                {/* <Skeleton className="mb-1 h-4 w-16" /> */}
                <div className="border-border bg-card mr-12 flex max-w-sm flex-col rounded-2xl rounded-bl-md border px-4 py-3 shadow-sm">
                  <Skeleton className="mb-2 h-4 w-56" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third message group with time divider */}
        <div className="px-4">
          <div className="my-3 flex justify-center">
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <div>
            <div className="group mb-1 flex flex-row-reverse items-end gap-3">
              <div className="flex flex-col">
                <div className="bg-primary/10 ml-12 flex max-w-sm flex-col rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                  <Skeleton className="mb-2 h-4 w-40" />
                  <Skeleton className="h-3 w-32 self-end" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left-aligned message with avatar */}
        <div className="px-4">
          <div>
            <div className="group mb-1 flex items-end gap-3">
              <span className="ring-background relative flex size-8 shrink-0 overflow-hidden rounded-full shadow-sm ring-2">
                <Skeleton className="aspect-square size-full rounded-full" />
              </span>
              <div className="flex flex-col">
                {/* <Skeleton className="mb-1 h-4 w-16" /> */}
                <div className="border-border bg-card mr-12 flex max-w-sm flex-col rounded-2xl rounded-bl-md border px-4 py-3 shadow-sm">
                  <Skeleton className="mb-2 h-4 w-52" />
                  <Skeleton className="h-3 w-34" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea
      ref={containerRef}
      style={{ overflowY: "scroll" }}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      className="flex-1"
    >
      <div ref={topAnchorRef} />
      <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        <div
          className="space-y-1 px-4"
          style={{
            transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
            // height: `${vItem.size}px`,
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0
          }}
        >
          {virtualItems.map((vItem) => {
            const message = messages?.[vItem.index];
            if (!message) return null;
            const isFromCurrentUser = message.senderId === me?.id;
            const { isFirstInGroup, isLastInGroup, hasTimeDiff } = getMessageGroupInfo(
              messages,
              vItem.index
            );

            return (
              <div
                className="px-4"
                key={vItem.key}
                data-index={vItem.index}
                ref={virtualizer.measureElement}
              >
                {hasTimeDiff && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                      {formatDividerTime(message.timestamp)}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={message}
                  isGroupChat={isGroupChat}
                  isFromCurrentUser={isFromCurrentUser}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                  participants={participants}
                />
              </div>
            );
          })}
          {typingUsers?.length ? (
            <div className="flex items-end space-x-2 px-4 pt-4">
              {/* avatar */}
              <img
                src={typingUsers?.[0]?.avatar ?? "/placeholder.svg"}
                alt={typingUsers?.[0]?.fullname ?? "User"}
                className="h-8 w-8 rounded-full object-cover"
              />

              {/* bubble */}
              <div className="bg-muted flex max-w-xs items-center gap-1 rounded-2xl px-3 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-[color:var(--color-typing-indicator)]"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div ref={bottomAnchorRef} />
    </ScrollArea>
  );
}
