import React, { useCallback } from "react";
import { SidebarMenuButton } from "@web/components/ui/sidebar";
import { cn } from "@web/lib/utils";
import { Badge } from "@web/components/ui/badge";
import { SearchItemAvatar } from "@web/components/chat/sidebar/search-item-avatar";

interface SearchUserItemProps {
  user: {
    id: string;
    fullname: string;
    avatar?: string | null;
  };
  isSelected?: boolean;
  isPending?: boolean;
  onSelect: (userId: string) => void;
}

export const SearchUserItem = React.memo(
  ({ user, isSelected, isPending, onSelect }: SearchUserItemProps) => {
    const handleClick = useCallback(() => {
      onSelect(user.id);
    }, [user.id, onSelect]);

    return (
      <SidebarMenuButton
        onClick={handleClick}
        className={cn(
          "flex h-full items-center gap-3 rounded-md px-3 py-1.5 text-left transition-colors",
          isSelected ? "bg-accent text-accent-foreground shadow-sm" : "hover:bg-accent/50",
          isPending && "pointer-events-none opacity-70"
        )}
      >
        <SearchItemAvatar user={{ avatar: user.avatar, name: user.fullname }} />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm leading-tight font-semibold">{user.fullname}</span>

            {isPending && (
              <Badge
                variant="secondary"
                className="bg-primary text-primary-foreground h-4 w-10 rounded-full px-1 text-[10px] font-medium"
              >
                Opening...
              </Badge>
            )}
          </div>
        </div>
      </SidebarMenuButton>
    );
  }
);

SearchUserItem.displayName = "SearchUserItem";
