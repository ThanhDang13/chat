import { ChatSidebarContent } from "@web/components/chat/sidebar/chat-sidebar-content";
import { Sidebar } from "@web/components/ui/sidebar";
import { cn } from "@web/lib/utils";
import React from "react";

export const ChatSidebar = React.memo(({ standalone = false }: { standalone?: boolean }) => {
  return (
    <Sidebar className={cn("border-r")} variant={"inset"} collapsible="offcanvas">
      <ChatSidebarContent />
    </Sidebar>
  );
});

ChatSidebar.displayName = "ChatSidebar";
