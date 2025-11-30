import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { ChatHeader } from "@web/components/chat/chat-header";
import { ChatInput } from "@web/components/chat/chat-input";

import { MessageList } from "@web/components/chat/message-list";

import { Card, CardContent, CardFooter, CardHeader } from "@web/components/ui/card";
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
    <Card className="bg-background mx-auto flex h-full w-full flex-col overflow-hidden py-0">
      <CardHeader className="flex-shrink-0 border-b">aaa</CardHeader>
      <CardContent className="flex flex-1 overflow-hidden">
        <MessageList conversationId={id} isGroupChat={true} />
      </CardContent>
      <CardFooter className="bg-muted/50 w-full flex-shrink-0 flex-col px-0">
        <ChatInput conversationId={id} />
      </CardFooter>
    </Card>
  );
}
