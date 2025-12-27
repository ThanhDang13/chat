import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { AvatarWithStatus } from "@web/components/avatar-with-status";
import { ModeToggle } from "@web/components/mode-toggle";
import { type Theme, useTheme } from "@web/components/theme-provider";
import { Button } from "@web/components/ui/button";
import { createGetProfileQueryOptions } from "@web/lib/tanstack/options/user/get-profile";
import { useAuthStore } from "@web/stores/auth-store";
import { Home, LogOut, User } from "lucide-react";
import { use, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@web/components/ui/tooltip";
import { cn } from "@web/lib/utils";

export default function Navigation() {
  const { setTheme } = useTheme();
  const { data: profile } = useQuery(createGetProfileQueryOptions());
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const queryClient = useQueryClient();

  const isProfile = matchRoute({ to: "/profile" });
  const isHome = matchRoute({ to: "/" }) || matchRoute({ to: "/chat/$id" });
  useEffect(() => {
    if (profile?.theme) {
      setTheme(profile.theme as Theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);
  return (
    <aside className="bg-background flex h-full w-16 flex-col items-center justify-start border-r md:w-20">
      <TooltipProvider>
        <div className="flex flex-col items-center gap-4 pt-4">
          {/* Avatar */}
          <AvatarWithStatus
            name={profile?.fullname ?? "Unknown"}
            avatar={profile?.avatar}
            isOnline={false}
            size={50}
          />

          <div className="mt-2 flex flex-col items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/" className="inline-flex">
                  <Button
                    size="icon"
                    variant={isHome ? "default" : "outline"}
                    className={cn(isHome && "bg-primary text-primary-foreground")}
                  >
                    <Home
                      className={cn(
                        "h-[1.2rem] w-[1.2rem]",
                        isHome ? "text-primary-foreground" : ""
                      )}
                    />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Home</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/profile" className="inline-flex">
                  <Button
                    size="icon"
                    variant={isProfile ? "default" : "outline"}
                    className={cn(isProfile && "bg-primary text-primary-foreground")}
                  >
                    <User
                      className={cn(
                        "h-[1.2rem] w-[1.2rem]",
                        isProfile ? "text-primary-foreground" : ""
                      )}
                    />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="mt-auto pb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                  queryClient.clear();
                }}
              >
                <LogOut className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </aside>
  );
}
