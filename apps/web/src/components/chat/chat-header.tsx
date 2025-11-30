import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { cn } from "@web/lib/utils";
import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversations/get-conversations.dto";

interface ChatHeaderProps {
  conversation: ConversationDTO;
  status?: string;
  children?: React.ReactNode;
}

export const ChatHeader = React.memo(({ conversation, status, children }: ChatHeaderProps) => {
  return (
    <div
      className={cn("bg-card text-card-foreground flex items-center justify-between border-b p-4")}
    >
      <div className="flex items-center">
        <Avatar className="mr-3 h-10 w-10">
          <AvatarImage
            src={conversation.avatar || "/placeholder.svg"}
            alt={`${conversation.name}'s avatar`}
          />
          <AvatarFallback>{conversation.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{conversation.name}</h2>
          {status && <p className="text-muted-foreground text-sm">{status}</p>}
        </div>
      </div>
      {children && <div className="flex items-center space-x-2">{children}</div>}
    </div>
  );
});

ChatHeader.displayName = "ChatHeader";
