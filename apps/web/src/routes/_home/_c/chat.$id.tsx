import { createFileRoute } from "@tanstack/react-router";
import { ChatWindow } from "@web/components/chat/chat-window";

import { useConversationTypingListener } from "@web/hooks/socket/use-conversation-typing-listener";

export const Route = createFileRoute("/_home/_c/chat/$id")({
  component: ChatId
});

function ChatId() {
  const { id } = Route.useParams();
  useConversationTypingListener(id);

  return (
    <div className="flex h-full w-full">
      <ChatWindow id={id} />
    </div>
  );
}
