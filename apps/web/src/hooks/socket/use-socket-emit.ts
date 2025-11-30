import { useSocketStore } from "@web/stores/socket-store";

export function useSocketEmit() {
  const socket = useSocketStore((s) => s.socket);
  return socket ? socket.emit.bind(socket) : undefined;
}
