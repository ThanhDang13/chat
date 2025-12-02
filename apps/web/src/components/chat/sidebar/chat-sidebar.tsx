import { ChatSidebarContent } from "@web/components/chat/sidebar/chat-sidebar-content";
import { Sidebar } from "@web/components/ui/sidebar";
import { cn } from "@web/lib/utils";
import React from "react";

export const ChatSidebar = React.memo(({ standalone = false }: { standalone?: boolean }) => {
  return (
    <Sidebar className={cn("border-r")} variant={"inset"} collapsible="offcanvas">
      <div className="flex h-full">
        {/* LEFT user/account panel */}
        <aside className="bg-background flex h-full w-16 flex-col justify-between border-r md:w-20">
          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="bg-muted h-10 w-10 rounded-full" />
            <div className="flex flex-col items-center gap-3">
              <div className="bg-muted h-8 w-8 rounded-lg" />
              <div className="bg-muted h-8 w-8 rounded-lg" />
              <div className="bg-muted h-8 w-8 rounded-lg" />
            </div>
          </div>

          <div className="flex flex-col items-center pb-4">
            <div className="bg-muted h-8 w-8 rounded-lg" />
          </div>
        </aside>

        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <ChatSidebarContent />
        </div>
      </div>
    </Sidebar>
  );
});

ChatSidebar.displayName = "ChatSidebar";
