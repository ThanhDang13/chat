import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@web/stores/auth-store";
import env from "@web/lib/env";

type SocketState = {
  socket: Socket | null;
  connect: () => Promise<Socket>;
  disconnect: () => void;
};

export const useSocketStore = create<SocketState>()(
  devtools((set, get) => ({
    socket: null,

    connect: async () => {
      const { me, token } = useAuthStore.getState();
      const currentSocket = get().socket;

      if (!me || !token) return;
      if (currentSocket?.connected || currentSocket) return;

      const newSocket = io(env.SEVER_URL, {
        path: "/socket.io",
        auth: { token },
        autoConnect: false
      });
      set({ socket: newSocket });

      await new Promise<void>((resolve, reject) => {
        newSocket.once("connect", () => resolve());
        newSocket.once("connect_error", reject);
        newSocket.connect();
      });

      newSocket.on("disconnect", () => set({ socket: null }));

      return newSocket;
    },

    disconnect: () => {
      const currentSocket = get().socket;
      if (currentSocket?.connected || currentSocket) {
        currentSocket.disconnect();
      }
      set({ socket: null });
    }
  }))
);
