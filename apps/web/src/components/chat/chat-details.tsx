import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversation-by-id/get-conversation-by-id.dto";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Badge } from "@web/components/ui/badge";
import { Button } from "@web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { cn } from "@web/lib/utils";
import { ChevronDown, File, Settings, Volume2, VolumeX } from "lucide-react";
import { AvatarWithStatus } from "@web/components/avatar-with-status";
import { useState } from "react";
import { updateConversation } from "@web/lib/tanstack/query-cache/update-conversation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@web/components/ui/collapsible";

type ChatDetailsProps = {
  conversation:
    | Pick<ConversationDTO, "id" | "avatar" | "isGroup" | "name" | "isMuted" | "bio">
    | undefined;
  isOnline: boolean;
  inSheet?: boolean;
};

export function ChatDetails({ conversation, isOnline, inSheet = false }: ChatDetailsProps) {
  const queryClient = useQueryClient();
  const toggleIsMuted = () => {
    if (conversation?.id) {
      updateConversation(queryClient, conversation.id, (conv) => ({
        ...conv,
        isMuted: !conversation.isMuted
      }));
    }
  };
  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden rounded-none",
        inSheet ? "h-full w-full border-0" : "w-72 border-l"
      )}
    >
      <CardHeader className="relative flex flex-col items-center justify-center gap-2 px-4 py-4">
        {/* Avatar */}
        <AvatarWithStatus
          name={conversation?.name ?? "Unnamed Chat"}
          avatar={conversation?.avatar}
          isOnline={isOnline}
          size={60}
        />

        {/* Name */}
        <CardTitle className="w-full truncate text-center">
          {conversation?.name ?? "Unnamed Chat"}
        </CardTitle>
        {conversation?.bio && (
          <CardTitle className="text-muted-foreground w-full truncate text-center text-sm">
            {conversation.bio}
          </CardTitle>
        )}

        {/* Action icons */}
        <div className="top-2 right-2 flex items-center gap-2">
          {/* Mute/Unmute */}
          <Button variant="ghost" size="icon" onClick={() => toggleIsMuted()}>
            {conversation?.isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-4">
        <Collapsible>
          <CollapsibleTrigger className="bg-muted flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm font-medium">
            Members
            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="text-muted-foreground px-4 pt-2 pb-1 text-xs">
            <ul className="space-y-1">
              <li>John Doe</li>
              <li>Jane Smith</li>
              <li>Alex Johnson</li>
              <li>+3 more</li>
            </ul>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible>
          <CollapsibleTrigger className="bg-muted flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm font-medium">
            Settings
            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="text-muted-foreground px-4 pt-2 pb-1 text-xs">
            <ul className="space-y-1">
              <li>Notifications: On</li>
              <li>Mute Conversation</li>
              <li>Change Theme</li>
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
