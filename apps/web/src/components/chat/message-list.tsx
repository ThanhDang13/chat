import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MessageBubble } from "@web/components/chat/message-bubble";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { useAutoScroll } from "@web/hooks/use-auto-scroll";
import { createInfiniteMessagesQueryOptions } from "@web/lib/tanstack/options/chat/chat";
import { formatDividerTime, getMessageGroupInfo } from "@web/lib/message";
import { createParticipantsQueryOptions } from "@web/lib/tanstack/options/conversation/participant";
import { useAuthStore } from "@web/stores/auth-store";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type Transition } from "framer-motion";
import { Skeleton } from "@web/components/ui/skeleton";
import { useSocketStore } from "@web/stores/socket-store";
import { Message } from "@api/modules/message/domain/message.domain";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { useConversationReadListener } from "@web/hooks/socket/use-conversation-read-listener";
import { resetConversationUnreadCount } from "@web/lib/tanstack/query-cache/reset-unread-count";
import { Button } from "@web/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@web/components/ui/empty";
import { ChevronDown, MessageSquareText } from "lucide-react";
import { AvatarGroup, AvatarGroupTooltip } from "@web/components/ui/avatar-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@web/components/ui/tooltip";
import { Spinner } from "@web/components/ui/spinner";
import { AvatarWithStatus } from "@web/components/avatar-with-status";

interface MessageListProps {
  conversationId: string;
  isGroupChat: boolean;
}

export function MessageList({ conversationId, isGroupChat }: MessageListProps) {
  const { me } = useAuthStore();
  const socket = useSocketStore((s) => s.socket);
  const queryClient = useQueryClient();
  const [jumpToMessageId, setJumpToMessageId] = useState<string | undefined>(undefined);
  const {
    data: messagesPages,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    isError,
    isFetching
  } = useInfiniteQuery({
    ...createInfiniteMessagesQueryOptions({
      conversationId,
      opts: { limit: 20, before: jumpToMessageId }
    }),
    enabled: !!conversationId
  });

  //TODO: Add this user state to be returned from api so can handle last read
  const { data: participantsData } = useQuery({
    ...createParticipantsQueryOptions({ conversationId }),
    enabled: !!conversationId
  });

  const messages = useMemo(() => {
    if (!messagesPages?.pages) return [];

    return messagesPages.pages.flatMap((page) => page.data ?? []);
  }, [messagesPages]);

  const participants = useMemo(
    () => (Array.isArray(participantsData) ? participantsData : []),
    [participantsData]
  );
  const thisParticipant = useMemo(
    () => participants.find((p) => p.userId === me?.id),
    [me?.id, participants]
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
    overscan: 5,
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
  }, [typingUsers]);

  useEffect(() => {
    if (!socket || messages.length === 0) return;
    if (virtualItems.length === 0) return;
    if (!thisParticipant || !me) return;

    const lastVisibleItem = virtualItems[virtualItems.length - 1];
    const lastVisibleMessage = messages[lastVisibleItem.index];
    if (!("id" in lastVisibleMessage)) return;

    if (
      !thisParticipant.lastReadMessageId ||
      lastVisibleMessage.id > thisParticipant.lastReadMessageId
    ) {
      queryClient.setQueryData<typeof participantsData>(
        ["participants", conversationId],
        (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((user) => {
            if (user.userId === me.id) {
              return {
                ...user,
                lastReadMessageId: lastVisibleMessage.id
              };
            }
            return user;
          });
        }
      );

      socket.emit("conversation:read:update", {
        conversationId,
        lastReadMessageId: lastVisibleMessage.id
      });

      resetConversationUnreadCount(queryClient, conversationId);

      console.log("[read:update]", lastVisibleMessage.id);
    }
  }, [virtualItems, messages, conversationId, socket, queryClient, thisParticipant, me]);

  useEffect(() => {
    scrollToBottomAnchor({ behavior: "instant" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (!jumpToMessageId) return;
    requestAnimationFrame(() => {
      const jumpToMessageIndex = messages.findIndex(
        (m): m is Message => "id" in m && m.id === jumpToMessageId
      );
      console.log(jumpToMessageIndex);
      if (jumpToMessageIndex === -1) {
        scrollToBottomAnchor({ behavior: "instant" });
        return;
      }
      virtualizer.scrollToIndex(jumpToMessageIndex, { align: "center", behavior: "auto" });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToMessageId]);

  useEffect(() => {
    const container = containerRef.current;
    const anchor = topAnchorRef.current;
    if (!container || !anchor) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        if (!hasPreviousPage || isFetchingPreviousPage) return;

        const result = await fetchPreviousPage();

        const index = result.data?.pages[0].data.length ?? 0;

        console.log("Previous page length:", index);
        virtualizer.scrollToIndex(index, { align: "start", behavior: "auto" });
      },
      {
        root: container,
        threshold: 1
      }
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [
    containerRef,
    virtualizer,
    messagesPages?.pages,
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage
  ]);

  useEffect(() => {
    const container = containerRef.current;
    const anchor = bottomAnchorRef.current;
    if (!container || !anchor) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        if (!hasNextPage || isFetchingNextPage || isFetching) return;

        fetchNextPage();
      },
      {
        root: container,
        threshold: 1
      }
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [
    containerRef,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    bottomAnchorRef,
    messages.length,
    virtualizer,
    isFetching
  ]);

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareText className="text-destructive h-8 w-8" />
            </EmptyMedia>
            <EmptyTitle>Failed to load messages</EmptyTitle>
            <EmptyDescription>
              Something went wrong while fetching messages. Please try again.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4">
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

  if ((!messages?.length || !messages) && !isFetching) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareText className="h-8 w-8" />
            </EmptyMedia>
            <EmptyTitle>No messages yet</EmptyTitle>
            <EmptyDescription>Start the conversation by sending a message.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <ScrollArea
      ref={containerRef}
      style={{ overflowY: "scroll" }}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      className="h-full flex-1"
    >
      <div ref={topAnchorRef} />
      {isFetchingPreviousPage && (
        <div className="flex justify-center py-2">
          <Spinner className="size-8" />
        </div>
      )}
      {!hasPreviousPage && (
        <div className="flex justify-center py-8">
          <Empty className="w-72">
            <EmptyHeader className="space-y-2 text-center">
              <EmptyMedia variant="icon" className="mx-auto">
                <MessageSquareText className="text-muted-foreground h-10 w-10" />
              </EmptyMedia>
              <EmptyTitle className="text-muted-foreground text-sm font-semibold">
                Start of Conversation
              </EmptyTitle>
              <EmptyDescription className="text-muted-foreground/80 text-sm">
                You’ve reached the oldest messages
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}

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
              <div key={vItem.key} data-index={vItem.index} ref={virtualizer.measureElement}>
                {hasTimeDiff && (
                  <div className="my-4 flex justify-center">
                    <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs shadow-sm">
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
          {/* {!isAtBottom && (
            <Button
              className="bg-primary text-primary-foreground fixed right-6 bottom-20 z-10 rounded-full p-3 shadow-lg"
              onClick={() => scrollToBottom()}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )} */}
          <TypingIndicator typingUsers={typingUsers} isGroupChat={isGroupChat} />
        </div>
      </div>
      <div ref={bottomAnchorRef} />
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Spinner className="size-8" />
        </div>
      )}
    </ScrollArea>
  );
}

interface TypingIndicatorProps {
  typingUsers: Array<{ avatar?: string | null; fullname?: string }>;
  isGroupChat: boolean;
}

const TYPING_INDICATOR_MAX_VISIBLE = 3;

function TypingIndicator({ typingUsers, isGroupChat }: TypingIndicatorProps) {
  if (!typingUsers?.length) return null;

  let typingText = "";

  if (typingUsers.length === 1) {
    typingText = `${typingUsers[0].fullname} is typing…`;
  } else if (typingUsers.length === 2) {
    typingText = `${typingUsers[0].fullname} and ${typingUsers[1].fullname} are typing…`;
  } else {
    const first = typingUsers[0].fullname;
    const others = typingUsers.length - 1;
    typingText = `${first} and ${others} others are typing…`;
  }

  return (
    <div className="flex items-end gap-2 pt-4">
      {isGroupChat && (
        <AvatarGroup variant="motion" className="-space-x-3">
          {typingUsers.slice(0, TYPING_INDICATOR_MAX_VISIBLE).map((user, index) => (
            <AvatarWithStatus
              key={index}
              name={user.fullname ?? "Unknown"}
              avatar={user.avatar}
              isOnline={false}
              size={40}
              inGroup={true}
              showToolTip={false}
            />
          ))}
        </AvatarGroup>
      )}

      {/* typing dots */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="bg-muted -mt-1 mb-1 flex items-center gap-1 rounded-2xl px-3 py-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="bg-foreground/50 h-2 w-2 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="text-muted-foreground flex animate-pulse items-center gap-1 text-xs leading-none italic">
            {typingText}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
