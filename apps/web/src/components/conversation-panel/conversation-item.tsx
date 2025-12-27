import React from "react";
import { useParams, Link } from "@tanstack/react-router";
import { Badge } from "@web/components/ui/badge";
import { cn } from "@web/lib/utils";
import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.dto";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@web/components/ui/item";
import { Button } from "@web/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@web/components/ui/dropdown-menu";
import { BellOff, MoreHorizontalIcon } from "lucide-react";
import { useAuthStore } from "@web/stores/auth-store";
import { AvatarWithStatus } from "@web/components/avatar-with-status";

interface ConversationItemProps {
  conversation: ConversationDTO;
}

export const ConversationItem = React.memo(({ conversation }: ConversationItemProps) => {
  const { me } = useAuthStore();
  const { id: activeConversationId } = useParams({ strict: false });
  const isActive = activeConversationId === conversation.id;
  const isOnline = conversation.participants.some((p) => p.status === "online");

  const lastMessage = conversation.lastMessage;
  const unread = conversation.unreadCount;
  const senderPreview = lastMessage
    ? lastMessage.senderId === me?.id
      ? "You"
      : (conversation.participants.find((p) => p.userId === lastMessage.senderId)?.username ??
        "Unknown")
    : "";

  return (
    <Item
      asChild
      role="button"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "hover:bg-accent/50 group relative flex cursor-pointer gap-3 px-3 py-2 transition-colors",
        isActive && "bg-accent text-accent-foreground shadow-sm"
      )}
    >
      <Link
        to="/chat/$id"
        params={{ id: conversation.id }}
        className="flex w-full items-center gap-3"
      >
        {/* Avatar */}
        <ItemMedia>
          <AvatarWithStatus
            name={conversation.name ?? "Unknown"}
            avatar={conversation.avatar}
            isOnline={isOnline}
            size={40}
          />
        </ItemMedia>

        {/* Main content */}
        <ItemContent className="flex min-w-0 flex-col">
          <ItemTitle className="truncate text-sm font-semibold">{conversation.name}</ItemTitle>

          <ItemDescription
            className={cn(
              "text-muted-foreground flex items-center gap-1 truncate text-xs",
              lastMessage?.type?.match("image") && "h-auto"
            )}
          >
            {lastMessage ? (
              lastMessage.type.match("image") ? (
                <span className="truncate">{senderPreview} sent a photo</span>
              ) : (
                <span className="truncate">
                  {senderPreview}: {lastMessage.content}
                </span>
              )
            ) : conversation.isGroup ? (
              <span className="truncate">Group created</span>
            ) : (
              <span className="truncate">No messages yet</span>
            )}
          </ItemDescription>
        </ItemContent>

        <ItemContent>
          {conversation.isMuted && <BellOff className="text-muted-foreground h-4 w-4" />}
        </ItemContent>

        <ItemContent>
          {unread > 0 && (
            <Badge
              variant="secondary"
              className={cn(
                "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold",
                "bg-primary text-primary-foreground shadow-sm"
              )}
            >
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}
        </ItemContent>

        <ItemActions className="absolute top-1/2 right-2 z-10 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="hover:bg-muted mr-4 flex h-8 w-8 items-center justify-center rounded-full md:mr-8">
                <MoreHorizontalIcon className="h-4 w-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </Link>
    </Item>
  );
});

ConversationItem.displayName = "ConversationItem";
