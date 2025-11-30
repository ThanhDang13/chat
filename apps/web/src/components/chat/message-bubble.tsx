import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { cn } from "@web/lib/utils";
import type { Message, PendingMessage } from "@api/modules/message/domain/message.domain";
import { type ParticipantDTO } from "@api/modules/conversation/application/queries/get-participants/get-participants.dto";
import { formatMessageTime } from "@web/lib/message";

// Utility type guard for pending messages
const isPendingMessage = (message: Message | PendingMessage): message is PendingMessage =>
  "status" in message;

export const messageBubbleVariants = cva(
  "flex flex-col max-w-sm shadow-sm transition-all duration-200 break-words relative",
  {
    variants: {
      isFromCurrentUser: {
        true: "bg-primary text-primary-foreground ml-12 rounded-2xl rounded-br-md",
        false: "bg-card text-card-foreground mr-12 rounded-2xl rounded-bl-md"
      },
      type: {
        text: "px-4 py-3 border border-border",
        image: "p-1 overflow-hidden",
        icon: "p-4 text-4xl border-none bg-transparent shadow-none" // big and clean
      }
    },
    defaultVariants: {
      isFromCurrentUser: false,
      type: "text"
    }
  }
);

// Props interface for MessageBubble
interface MessageBubbleProps extends VariantProps<typeof messageBubbleVariants> {
  message: Message | PendingMessage;
  isGroupChat: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  participants: ParticipantDTO[] | undefined;
}

// MessageTimestamp sub-component
const MessageTimestamp = React.memo(
  ({ isFromCurrentUser, timestamp }: { isFromCurrentUser: boolean; timestamp: Date }) => (
    <span
      className={cn(
        "text-opacity-70 mt-1 text-xs font-medium",
        isFromCurrentUser ? "text-muted-foreground" : "text-muted-foreground"
      )}
    >
      {formatMessageTime(new Date(timestamp))}
    </span>
  )
);

// MessageStatus sub-component for pending/failed messages
const MessageStatus = React.memo(
  ({
    isFromCurrentUser,
    status
  }: {
    isFromCurrentUser: boolean;
    status: PendingMessage["status"];
  }) => (
    <span
      className={cn(
        "mt-1 flex items-center gap-1 text-xs font-semibold",
        status === "failed" ? "text-destructive" : "text-yellow-500", // Using shadcn destructive color
        isFromCurrentUser ? "text-primary-foreground text-opacity-80" : ""
      )}
    >
      {status === "pending" && <div className="h-2 w-2 animate-pulse rounded-full bg-current" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
);

// Main MessageBubble component
export const MessageBubble = React.memo(
  ({
    message,
    isFromCurrentUser,
    isGroupChat,
    isFirstInGroup,
    isLastInGroup,
    participants
  }: MessageBubbleProps) => {
    // find sender from participants
    const sender = participants?.find((p) => p.userId === message.senderId);
    // const { me } = useAuthStore();

    const readByParticipants =
      !isPendingMessage(message) && participants
        ? participants
            // .filter((p) => p.userId !== me?.id)
            .filter((p) => p.lastReadMessageId === message.id)
        : [];

    const showAvatar = !isFromCurrentUser && isGroupChat;
    const showSenderName = isGroupChat && isFirstInGroup && !isFromCurrentUser;

    return (
      <div>
        <div
          className={cn("group flex items-end gap-3 pb-1", isFromCurrentUser && "flex-row-reverse")}
        >
          {showAvatar && sender && (
            <Avatar
              className={cn(
                "ring-background size-8 shadow-sm ring-2",
                isLastInGroup ? "" : "invisible"
              )}
            >
              <AvatarImage src={sender.avatar ?? undefined} alt={sender.fullname} />
              <AvatarFallback className="text-primary-foreground bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold">
                {sender.fullname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          <div
            className={cn("flex flex-col items-start", isFromCurrentUser && "items-end self-end")}
          >
            {showSenderName && sender && (
              <p
                className={cn(
                  "mb-1 text-sm font-semibold",
                  isFromCurrentUser
                    ? "text-primary-foreground text-opacity-90"
                    : "text-muted-foreground"
                )}
              >
                {sender.fullname}
              </p>
            )}

            <div
              className={cn(
                messageBubbleVariants({
                  isFromCurrentUser,
                  type: message.type
                }),
                "inline-flex w-fit flex-col"
              )}
            >
              {message.type === "text" && (
                <span className={cn("text-sm leading-relaxed")}>{message.content}</span>
              )}
              {message.type === "image" && (
                <img
                  src={message.content ?? "/placeholder.svg"}
                  alt="Sent"
                  className="rounded-lg"
                />
              )}
              {message.type === "icon" && <span className="text-xl">{message.content}</span>}
            </div>
            <span className={cn("flex flex-row gap-2 px-2")}>
              <MessageTimestamp
                isFromCurrentUser={!!isFromCurrentUser}
                timestamp={message.timestamp}
              />
              {isPendingMessage(message) && (
                <MessageStatus isFromCurrentUser={!!isFromCurrentUser} status={message.status} />
              )}
            </span>
          </div>
        </div>
        {readByParticipants?.length > 0 && (
          <div className="mt-1 flex justify-end -space-x-2">
            {readByParticipants.map((p) => (
              <Avatar key={p.userId} className="ring-background size-4 ring-1">
                <AvatarImage src={p.avatar ?? undefined} alt={p.fullname} />
                <AvatarFallback className="bg-gray-300 text-xs font-semibold">
                  {p.fullname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
      </div>
    );
  }
);
MessageBubble.displayName = "MessageBubble";
MessageTimestamp.displayName = "MessageTimestamp";
MessageStatus.displayName = "MessageStatus";
