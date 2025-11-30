import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { AuthUser } from "@api/modules/auth/application/commands/login/login.dto";
import { useSocketStore } from "@web/stores/socket-store";

type AuthState = {
  me: AuthUser | null;
  token: string | null;
  login: (data: { me: AuthUser; token: string }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        me: null,
        token: null,

        login: ({ me, token }) => set({ me, token }),

        logout: () => {
          const { disconnect } = useSocketStore.getState();
          disconnect();
          set({ me: null, token: null });
        }
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          me: state.me,
          token: state.token
        })
      }
    )
  )
);
