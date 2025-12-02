import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { ChatHeader } from "@web/components/chat/chat-header";
import { ChatInput } from "@web/components/chat/chat-input";

import { MessageList } from "@web/components/chat/message-list";
import { Button } from "@web/components/ui/button";

import { Card, CardContent, CardFooter, CardHeader } from "@web/components/ui/card";
import { ScrollArea } from "@web/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@web/components/ui/sheet";
import { useSidebar } from "@web/components/ui/sidebar";

import { useConversationTypingListener } from "@web/hooks/socket/use-conversation-typing-listener";
import { useEffect } from "react";

export const Route = createFileRoute("/_c/chat/$id")({
  component: ChatId
});

function ChatId() {
  const { id } = Route.useParams();
  useConversationTypingListener(id);

  const { setOpen, isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (!isMobile) {
      setOpen(true);
      return;
    }
    setOpenMobile(false);
  }, [isMobile, setOpen, setOpenMobile]);

  return (
    <div className="flex h-full w-full">
      {/* Main Chat Card */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="flex flex-shrink-0 items-center justify-between border-b px-4 py-2">
          Chat Title
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Info
              </Button>
            </SheetTrigger>

            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Group / User Info</SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-3">
                {/* Sidebar content: members, settings, etc */}
                <div className="hover:bg-accent/50 cursor-pointer rounded-md p-2">Member 1</div>
                <div className="hover:bg-accent/50 cursor-pointer rounded-md p-2">Member 2</div>
                <div className="hover:bg-accent/50 cursor-pointer rounded-md p-2">Member 3</div>
              </div>

              <SheetClose asChild>
                <Button className="mt-4 w-full">Close</Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </CardHeader>

        <CardContent className="flex flex-1 overflow-hidden">
          <ScrollArea className="flex-1 overflow-y-auto">
            <MessageList conversationId={id} isGroupChat={true} />
          </ScrollArea>
        </CardContent>

        <CardFooter className="bg-muted/50 w-full flex-shrink-0 flex-col px-0">
          <ChatInput conversationId={id} />
        </CardFooter>
      </Card>
    </div>
  );
}
