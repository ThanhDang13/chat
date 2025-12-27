import { createFileRoute, Outlet } from "@tanstack/react-router";
import Navigation from "@web/components/navigation/navigation";
import { useMessageListener } from "@web/hooks/socket/use-message-listener";
import { useUserStatusListener } from "@web/hooks/socket/use-user-status-listener";
import { useIsMobile } from "@web/hooks/use-mobile";
import { useSocketStore } from "@web/stores/socket-store";
import { useEffect } from "react";

export const Route = createFileRoute("/_home")({
  component: HomeLayoutRoute
});

function HomeLayoutRoute() {
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
      <Navigation />
      <Outlet />
    </div>
  );
}
