import { Message, PendingMessage } from "@api/modules/message/domain/message.domain";

export function getMessageGroupInfo(messages: (Message | PendingMessage)[], currentIndex: number) {
  const currentMessage = messages[currentIndex];
  const prevMessage = messages[currentIndex - 1];
  const nextMessage = messages[currentIndex + 1];

  const currentCreatedAt = new Date(currentMessage.timestamp).getTime();
  const prevCreatedAt = prevMessage ? new Date(prevMessage.timestamp).getTime() : null;
  const nextCreatedAt = nextMessage ? new Date(nextMessage.timestamp).getTime() : null;

  const TIME_DIFF = 5 * 60 * 1000; // 5 minutes

  const isFirstInGroup =
    !prevMessage ||
    prevMessage.senderId !== currentMessage.senderId ||
    (prevCreatedAt !== null && currentCreatedAt - prevCreatedAt > TIME_DIFF);

  const isLastInGroup =
    !nextMessage ||
    nextMessage.senderId !== currentMessage.senderId ||
    (nextCreatedAt !== null && nextCreatedAt - currentCreatedAt > TIME_DIFF);

  const hasTimeDiff = prevCreatedAt === null || currentCreatedAt - prevCreatedAt > TIME_DIFF;

  return {
    isFirstInGroup,
    isLastInGroup,
    hasTimeDiff
  };
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isYesterday(d1: Date, d2: Date) {
  const yesterday = new Date(d2);
  yesterday.setDate(d2.getDate() - 1);
  return isSameDay(d1, yesterday);
}

export function formatMessageTime(datetime: Date | string): string {
  const now = new Date();
  const date = new Date(datetime);

  if (isSameDay(date, now)) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  }

  if (isYesterday(date, now)) {
    return "Yesterday";
  }

  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: "short" });
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDividerTime(datetime: Date | string): string {
  const now = new Date();
  const date = new Date(datetime);
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  if (isSameDay(date, now)) {
    return `Today ${time}`;
  }

  if (isYesterday(date, now)) {
    return `Yesterday ${time}`;
  }

  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    // Show weekday for messages within the last week
    return `${date.toLocaleDateString(undefined, { weekday: "long" })} ${time}`;
  }

  // Older messages: show month/day, add year if not current year
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  return `${date.toLocaleDateString(undefined, options)} ${time}`; // "Sep 2" or "Sep 2, 2024"
}
