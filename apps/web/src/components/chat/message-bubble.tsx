import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { cn, replaceHost } from "@web/lib/utils";
import type { Message, PendingMessage } from "@api/modules/message/domain/message.domain";
import { type ParticipantDTO } from "@api/modules/conversation/application/queries/get-participants/get-participants.dto";
import { formatMessageTime } from "@web/lib/message";
import { Tooltip, TooltipContent, TooltipTrigger } from "@web/components/ui/tooltip";
import { ImageZoom } from "@web/components/ui/image-zoom";
import { AvatarGroup, AvatarGroupTooltip } from "@web/components/ui/avatar-group";
import { useAuthStore } from "@web/stores/auth-store";
import env from "@web/lib/env";
import { AvatarWithStatus } from "@web/components/avatar-with-status";

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
        image: "overflow-hidden",
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
    const sender = participants?.find((p) => p.userId === message.senderId);
    const { me } = useAuthStore();

    const readByParticipants =
      !isPendingMessage(message) && participants
        ? participants
            .filter((p) => p.userId !== me?.id)
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
            <Tooltip>
              <TooltipTrigger asChild>
                <AvatarWithStatus
                  name={sender.fullname ?? "Unknown"}
                  avatar={sender.avatar}
                  isOnline={false}
                  size={40}
                  className={cn(
                    "ring-background size-8 shadow-sm ring-2",
                    isLastInGroup ? "" : "invisible"
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-md px-2 py-1 shadow-md">
                <p className="text-muted-foreground text-opacity-70 text-xs font-medium">
                  {sender.fullname}
                </p>
              </TooltipContent>
            </Tooltip>
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

            <Tooltip>
              <TooltipTrigger asChild>
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
                    <ImageZoom>
                      <img
                        src={
                          replaceHost(message.content, env.VITE_REPLACE_S3_HOST) ??
                          "/placeholder.svg"
                        }
                        alt="Sent"
                        className="rounded-lg"
                      />
                    </ImageZoom>
                  )}
                  {message.type === "icon" && <span className="text-xl">{message.content}</span>}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <MessageTimestamp
                  isFromCurrentUser={!!isFromCurrentUser}
                  timestamp={message.timestamp}
                />
              </TooltipContent>
            </Tooltip>

            <span className={cn("flex flex-row gap-2 px-2")}>
              {/* <MessageTimestamp
                isFromCurrentUser={!!isFromCurrentUser}
                timestamp={message.timestamp}
              /> */}
              {isPendingMessage(message) && (
                <MessageStatus isFromCurrentUser={!!isFromCurrentUser} status={message.status} />
              )}
            </span>
          </div>
        </div>
        {readByParticipants?.length > 0 && (
          <AvatarGroup variant="motion" className="mt-1 flex justify-end -space-x-2">
            {readByParticipants.map((p, index) => (
              // <Avatar key={p.userId} className="ring-background size-4 border ring-1">
              //   <AvatarImage src={p.avatar ?? undefined} alt={p.fullname} />
              //   <AvatarFallback className="bg-muted text-[10px] font-semibold">
              //     {p.fullname?.charAt(0)?.toUpperCase()}
              //   </AvatarFallback>
              //   <AvatarGroupTooltip>
              //     <p className="text-muted-foreground text-xs font-medium">{p.fullname}</p>
              //   </AvatarGroupTooltip>
              // </Avatar>
              <AvatarWithStatus
                key={index}
                name={p.fullname ?? "Unknown"}
                avatar={p.avatar}
                isOnline={false}
                size={18}
                inGroup={true}
                showToolTip={true}
              />
            ))}
          </AvatarGroup>
        )}
      </div>
    );
  }
);
MessageBubble.displayName = "MessageBubble";
MessageTimestamp.displayName = "MessageTimestamp";
MessageStatus.displayName = "MessageStatus";
