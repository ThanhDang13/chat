import React, { useCallback } from "react";
import { cn } from "@web/lib/utils";
import { Badge } from "@web/components/ui/badge";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@web/components/ui/item";
import { AvatarWithStatus } from "@web/components/avatar-with-status";
import { Spinner } from "@web/components/ui/spinner";

interface SearchUserItemProps {
  user: {
    id: string;
    fullname: string;
    avatar?: string | null;
    email: string;
  };
  isSelected?: boolean;
  isPending?: boolean;
  onSelect: (userId: string) => void;
}

export const SearchUserItem = React.memo(
  ({ user, isSelected, isPending, onSelect }: SearchUserItemProps) => {
    const handleClick = useCallback(() => {
      if (!isPending) onSelect(user.id);
    }, [user.id, onSelect, isPending]);

    return (
      <Item
        role="button"
        onClick={handleClick}
        aria-current={isSelected ? "true" : undefined}
        className={cn(
          "flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors",
          isSelected && "bg-accent text-accent-foreground shadow-sm",
          !isSelected && "hover:bg-accent/50",
          isPending && "pointer-events-none opacity-60"
        )}
      >
        {/* Avatar */}
        <ItemMedia>
          <AvatarWithStatus
            name={user.fullname ?? "Unnamed Chat"}
            avatar={user.avatar}
            isOnline={false}
            size={40}
          />
        </ItemMedia>

        {/* User info */}
        <ItemContent className="flex min-w-0 gap-2">
          <div className="flex min-w-0 flex-col">
            <ItemTitle className="truncate text-sm font-semibold">{user.fullname}</ItemTitle>

            <ItemDescription className="text-muted-foreground truncate text-xs">
              {user.email}
            </ItemDescription>
          </div>
        </ItemContent>
        {isPending && <Spinner />}
      </Item>
    );
  }
);

SearchUserItem.displayName = "SearchUserItem";
