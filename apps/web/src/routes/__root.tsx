import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@web/components/theme-provider";
import { SidebarProvider } from "@web/components/ui/sidebar";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <main>
            <Outlet />
            <Toaster />
          </main>
        </ThemeProvider>
        {/* <TanStackRouterDevtools /> */}
      </>
    );
  }
});
