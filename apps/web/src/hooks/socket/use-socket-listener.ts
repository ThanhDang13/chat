import { useEffect } from "react";
import { useSocketStore } from "@web/stores/socket-store";

export function useSocketListener<T>(event: string, handler: (data: T) => void) {
  const socket = useSocketStore((s) => s.socket);

  useEffect(() => {
    if (!socket) return;

    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
}
