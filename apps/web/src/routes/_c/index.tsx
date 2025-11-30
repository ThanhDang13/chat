import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ChatSidebar } from "@web/components/chat/sidebar/chat-sidebar";
import { ChatSidebarContent } from "@web/components/chat/sidebar/chat-sidebar-content";
import { ConversationList } from "@web/components/chat/sidebar/conversation-list";
import { useSidebar } from "@web/components/ui/sidebar";
import { useIsMobile } from "@web/hooks/use-mobile";
import { useEffect } from "react";

export const Route = createFileRoute("/_c/")({
  component: Index
});

function Index() {
  const { setOpen, isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (!isMobile) {
      setOpen(true);
      return;
    }

    setOpenMobile(true);
  }, [isMobile, setOpen, setOpenMobile]);

  return (
    <div className="bg-background flex h-svh w-full">
      <div className="flex flex-1 items-center justify-center">
        <p>Select a conversation to start chatting.</p>
      </div>
    </div>
  );
}
