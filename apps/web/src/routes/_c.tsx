import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ChatSidebar } from "@web/components/chat/sidebar/chat-sidebar";
import { SidebarInset, SidebarProvider, useSidebar } from "@web/components/ui/sidebar";
import { useMessageListener } from "@web/hooks/socket/use-message-listener";
import { useUserStatusListener } from "@web/hooks/socket/use-user-status-listener";
import { useIsMobile } from "@web/hooks/use-mobile";
import { useSocketStore } from "@web/stores/socket-store";
import { useEffect } from "react";

export const Route = createFileRoute("/_c")({
  component: ChatLayoutRoute
});

function ChatLayoutRoute() {
  const connect = useSocketStore((s) => s.connect);

  useEffect(() => {
    (async () => {
      const s = await connect();
      if (s) console.log("🔌 Socket ready:", s.id);
    })();
    return () => {
      useSocketStore.getState().disconnect();
    };
  }, [connect]);
  useMessageListener();
  useUserStatusListener();

  return (
    <div className="flex h-screen w-full">
      <SidebarProvider>
        <ChatSidebar />
        <SidebarInset className="!m-1 !p-0 ml-0 rounded-none shadow-none">
          <div className="flex h-full flex-1 flex-col">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
