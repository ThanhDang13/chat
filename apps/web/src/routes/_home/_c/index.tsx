import { createFileRoute, useLocation } from "@tanstack/react-router";
import ConversationPanel from "@web/components/conversation-panel/conversation-panel";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@web/components/ui/empty";
import { useSidebar } from "@web/components/ui/sidebar";
import { useIsMobile } from "@web/hooks/use-mobile";
import { MessageSquareText } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_home/_c/")({
  component: Index
});

function Index() {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <ConversationPanel />;
  }
  return (
    <div className="bg-background flex h-svh w-full">
      <div className="flex flex-1 items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareText className="h-10 w-10" />
            </EmptyMedia>

            <EmptyTitle>No Conversation Selected</EmptyTitle>

            <EmptyDescription>
              Choose a conversation from the left to start chatting.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </div>
  );
}
