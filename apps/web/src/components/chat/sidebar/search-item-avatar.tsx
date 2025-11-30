import { Avatar, AvatarImage, AvatarFallback } from "@web/components/ui/avatar";

interface ChatAvatarWithStatusProps {
  user: {
    name: string;
    avatar?: string | null;
  };
}

export function SearchItemAvatar({ user }: ChatAvatarWithStatusProps) {
  return (
    <div className="relative">
      <Avatar className="bg-muted flex h-10 w-10 shrink-0 overflow-hidden rounded-full border">
        <AvatarImage
          className="h-full w-full object-cover"
          src={user.avatar || "/placeholder.svg"}
          alt={`${user.name}'s avatar`}
        />
        <AvatarFallback className="bg-muted flex h-10 w-10 shrink-0 overflow-hidden rounded-full border">
          {user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
