import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import ConversationPanel from "@web/components/conversation-panel/conversation-panel";
import Navigation from "@web/components/navigation/navigation";
import { SidebarInset, SidebarProvider, useSidebar } from "@web/components/ui/sidebar";
import { useMessageListener } from "@web/hooks/socket/use-message-listener";
import { useUserStatusListener } from "@web/hooks/socket/use-user-status-listener";
import { useIsMobile } from "@web/hooks/use-mobile";
import { useSocketStore } from "@web/stores/socket-store";
import { useEffect } from "react";

export const Route = createFileRoute("/_home/_c")({
  component: ChatLayoutRoute
});

function ChatLayoutRoute() {
  const isMobile = useIsMobile();

  return (
    <main className="flex w-full flex-1">
      {!isMobile && (
        <div className="h-full w-[25vw] max-w-xs">
          <ConversationPanel />
        </div>
      )}
      <Outlet />
    </main>
  );
}
