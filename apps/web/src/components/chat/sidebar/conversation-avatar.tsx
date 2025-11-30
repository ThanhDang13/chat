import { Avatar, AvatarImage, AvatarFallback } from "@web/components/ui/avatar";

interface ChatAvatarWithStatusProps {
  conversation: {
    name: string;
    avatar?: string;
  };
  isOnline: boolean;
}

export function ConversationAvatar({ conversation, isOnline }: ChatAvatarWithStatusProps) {
  return (
    <div className="relative">
      <Avatar className="bg-muted flex h-10 w-10 shrink-0 overflow-hidden rounded-full border">
        <AvatarImage
          className="h-full w-full object-cover"
          src={conversation.avatar || "/placeholder.svg"}
          alt={`${conversation.name}'s avatar`}
        />
        <AvatarFallback className="bg-muted flex h-10 w-10 shrink-0 overflow-hidden rounded-full border">
          {conversation.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      {isOnline && (
        <div className="border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 bg-green-500" />
      )}
    </div>
  );
}
