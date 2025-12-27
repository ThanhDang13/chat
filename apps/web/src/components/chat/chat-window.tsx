import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@web/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@web/components/ui/sheet";
import { Button } from "@web/components/ui/button";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { useState } from "react";
import { useIsMobile } from "@web/hooks/use-mobile";
import { InfiniteData, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ConversationsPage,
  createGetConversationByIdQueryOptions
} from "@web/lib/tanstack/options/conversation/conversation";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Badge } from "@web/components/ui/badge";
import { Info } from "lucide-react";
import { ChatDetails } from "@web/components/chat/chat-details";
import { AvatarWithStatus } from "@web/components/avatar-with-status";

interface ChatWindowProps {
  id: string;
}

export function ChatWindow({ id }: ChatWindowProps) {
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();
  const { data: conversation } = useQuery({
    ...createGetConversationByIdQueryOptions({ conversationId: id }),
    initialData: () => {
      const list = queryClient.getQueryData<InfiniteData<ConversationsPage>>(["conversations"]);

      if (!list) return undefined;

      for (const page of list.pages) {
        const found = page.data.find((c) => c.id === id);

        if (found) {
          return found;
        }
      }

      return undefined;
    },
    select: (data) => ({
      id: data.id,
      isGroup: data.isGroup,
      name: data.name,
      bio: data.bio,
      avatar: data.avatar,
      participants: data.participants,
      isMuted: data.isMuted
    })
  });
  const isOnline = conversation?.participants.some((p) => p.status === "online");

  return (
    <div className="flex h-full flex-1 overflow-hidden">
      <Card className="m-0! flex flex-1 flex-col overflow-hidden rounded-none border-0 pb-0!">
        <CardHeader className="flex h-14 items-center justify-between border-b px-4 py-2">
          <div className="relative flex min-w-0 items-center gap-3">
            <AvatarWithStatus
              name={conversation?.name ?? "?"}
              avatar={conversation?.avatar}
              isOnline={isOnline}
              size={40}
            />

            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">{conversation?.name ?? "Unnamed Chat"}</CardTitle>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setShowDetails((v) => !v);
            }}
          >
            <Info className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="h-full flex-1 overflow-hidden p-0">
          <MessageList conversationId={id} isGroupChat={true} />
        </CardContent>

        <CardFooter className="bg-background border-t p-2 pt-3!">
          <ChatInput conversationId={id} />
        </CardFooter>
      </Card>

      {!isMobile && showDetails && <ChatDetails conversation={conversation} isOnline />}

      {isMobile && (
        <Sheet open={showDetails} onOpenChange={setShowDetails}>
          <SheetContent side="right" className="w-[calc(100vw-4rem)] max-w-full md:w-[25vw]">
            <ChatDetails conversation={conversation} isOnline inSheet />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
