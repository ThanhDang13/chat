"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Volume2, VolumeX, Users, ShieldCheck, MoreHorizontal } from "lucide-react";

import { ConversationDTO } from "@api/modules/conversation/application/queries/get-conversation-by-id/get-conversation-by-id.dto";
import { AvatarWithStatus } from "@web/components/avatar-with-status";
import { Button } from "@web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@web/components/ui/collapsible";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { Separator } from "@web/components/ui/separator";

import { updateConversation } from "@web/lib/tanstack/query-cache/update-conversation";
import { cn } from "@web/lib/utils";
import { createParticipantsQueryOptions } from "@web/lib/tanstack/options/conversation/participant";

type ChatDetailsProps = {
  conversation:
    | Pick<
        ConversationDTO,
        "id" | "avatar" | "isGroup" | "name" | "isMuted" | "bio" | "participants"
      >
    | undefined;
  isOnline: boolean;
  inSheet?: boolean;
};

export function ChatDetails({ conversation, isOnline, inSheet = false }: ChatDetailsProps) {
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery(
    createParticipantsQueryOptions({ conversationId: conversation?.id ?? "" })
  );

  const toggleIsMuted = () => {
    if (conversation?.id) {
      updateConversation(queryClient, conversation.id, (conv) => ({
        ...conv,
        isMuted: !conversation.isMuted
      }));
    }
  };

  if (!conversation) return null;

  return (
    <Card
      className={cn(
        "bg-background flex flex-col overflow-hidden rounded-none",
        inSheet ? "h-full w-full border-0" : "w-80 border-l"
      )}
    >
      <ScrollArea className="flex-1">
        <CardHeader className="flex flex-col items-center justify-center gap-3 px-6 py-8">
          <AvatarWithStatus
            name={conversation.name ?? "Unnamed Chat"}
            avatar={conversation.avatar}
            isOnline={isOnline}
            size={80}
          />

          <div className="space-y-1 text-center">
            <CardTitle className="line-clamp-1 text-xl">
              {conversation.name ?? "Unnamed Chat"}
            </CardTitle>
            {conversation.bio && (
              <p className="text-muted-foreground text-sm leading-relaxed">{conversation.bio}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-9 w-full gap-2 px-4"
              onClick={toggleIsMuted}
            >
              {conversation.isMuted ? (
                <>
                  <VolumeX className="text-destructive h-4 w-4" /> Unmute
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" /> Mute
                </>
              )}
            </Button>
            <Button variant="secondary" size="icon" className="h-9 w-9">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* <Separator /> */}

        <CardContent className="space-y-4 p-4">
          {/* Members Section - Only for Groups */}
          {conversation.isGroup && (
            <Collapsible defaultOpen className="group/collapsible">
              <CollapsibleTrigger className="hover:bg-muted flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors">
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span>Members</span>
                  <span className="text-muted-foreground ml-1 font-normal">
                    {members?.length ?? 0}
                  </span>
                </div>
                <ChevronDown className="text-muted-foreground h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-1 pt-2">
                {isLoading ? (
                  <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-xs italic">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading members...
                  </div>
                ) : (
                  members?.map((member) => (
                    <div
                      key={member.userId}
                      className="hover:bg-accent flex items-center justify-between rounded-md px-3 py-2 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <AvatarWithStatus
                          name={member.fullname}
                          avatar={member.avatar}
                          size={32}
                          isOnline={
                            conversation.participants.find((p) => member.userId === p.userId)
                              ?.status === "online"
                          }
                        />
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-sm leading-none font-medium">
                            {member.fullname}
                          </span>
                          {member.role === "owner" ? (
                            <span className="text-muted-foreground mt-1 text-[10px]">Admin</span>
                          ) : (
                            <span className="text-muted-foreground mt-1 text-[10px]">Member</span>
                          )}
                        </div>
                      </div>

                      {member.role === "owner" && (
                        <ShieldCheck className="text-primary h-3.5 w-3.5 opacity-70" />
                      )}
                    </div>
                  ))
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Additional Sections (Files, Media, Privacy) */}
          <div className="space-y-1">
            {/* <Button variant="ghost" className="w-full justify-start px-3 font-normal">
              Privacy & Support
            </Button> */}
            {/* <Button
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-start px-3 font-normal"
            >
              {conversation.isGroup ? "Leave Group" : "Block User"}
            </Button> */}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
