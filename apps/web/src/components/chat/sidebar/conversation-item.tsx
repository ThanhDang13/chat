import React, { useCallback } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Badge } from "@web/components/ui/badge";
import { SidebarMenuButton } from "@web/components/ui/sidebar";
import { cn } from "@web/lib/utils";
import { ConversationAvatar } from "@web/components/chat/sidebar/conversation-avatar";
import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.dto";

interface ConversationItemProps {
  conversation: ConversationDTO;
}

export const ConversationItem = React.memo(({ conversation }: ConversationItemProps) => {
  const { id: activeConversationId } = useParams({ strict: false });
  const isActive = activeConversationId === conversation.id;
  const navigate = useNavigate();
  const isOnline = conversation.participants.some((p) => p.status === "online");

  const handleClick = useCallback(() => {
    navigate({ to: "/chat/$id", params: { id: conversation.id } });
  }, [conversation.id, navigate]);
  return (
    <SidebarMenuButton
      onClick={handleClick}
      isActive={isActive}
      className={cn(
        "hover:bg-accent/50 flex h-full gap-3 px-3 py-1.5 text-left transition-colors",
        isActive && "bg-accent text-accent-foreground shadow-sm"
      )}
      aria-current={isActive ? "page" : undefined}
      role="button"
    >
      <ConversationAvatar
        conversation={{
          name: conversation.name ?? "test",
          avatar: conversation.avatar ?? "test"
        }}
        isOnline={isOnline}
      />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="h-4 w-3/4 truncate text-sm leading-tight font-semibold">
            {conversation.name}
          </span>
          {conversation.unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-primary text-primary-foreground h-5 w-8 shrink-0 rounded-full px-1.5 text-xs font-bold shadow-sm"
            >
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </Badge>
          )}
        </div>
        {conversation.lastMessage ? (
          conversation.lastMessage.type.match("IMAGE") ? (
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <img
                src={conversation.lastMessage.content}
                alt="Image message"
                className="h-4 w-4 rounded-sm object-cover"
              />
              <span className="truncate">Photo</span>
            </div>
          ) : (
            <p className="text-muted-foreground h-4 truncate text-xs leading-4">
              {conversation.lastMessage.content}
            </p>
          )
        ) : (
          <p className="text-muted-foreground h-4 truncate text-xs leading-4">No messages yet</p>
        )}
      </div>
    </SidebarMenuButton>
  );
});

ConversationItem.displayName = "ConversationItem";
