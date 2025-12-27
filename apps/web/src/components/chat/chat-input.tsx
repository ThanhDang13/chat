import React, { useState, useRef, useCallback, useEffect } from "react";
import { Input } from "@web/components/ui/input";
import { Button } from "@web/components/ui/button";
import { Send, Paperclip, XCircle } from "lucide-react";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@web/stores/auth-store";
import { useDebounce } from "@web/hooks/use-debounce";
import { useSocketStore } from "@web/stores/socket-store";
import { MessagesPage } from "@web/lib/tanstack/options/chat/chat";
import { PendingMessage } from "@api/modules/message/domain/message.domain";
import type { CallbackMessage } from "@api/modules/message/application/commands/create-message/create-message.dto";
import {
  ConversationsPage,
  getConversationById
} from "@web/lib/tanstack/options/conversation/conversation";
import { addMessageToCache } from "@web/lib/tanstack/query-cache/add-message-to-cache";
import { uploadFile } from "@web/lib/s3/upload";
import { EmojiPicker } from "@web/components/chat/emoji-picker";
import { updateConversation } from "@web/lib/tanstack/query-cache/update-conversation";
import { updateConversationPreview } from "@web/lib/tanstack/query-cache/update-conversation-preview";

interface ChatInputProps {
  conversationId: string;
}

export const ChatInput = React.memo(({ conversationId }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { me } = useAuthStore();
  const socket = useSocketStore((s) => s.socket);

  const debouncedMessage = useDebounce(message, 1000);

  useEffect(() => {
    if (!socket || !me?.id) return;

    const typingPayload = { conversationId };

    if (!isTyping && message !== "" && message !== debouncedMessage) {
      setIsTyping(true);
      socket.emit("conversation:typing:start", typingPayload);
    }

    if (isTyping && (message === "" || message === debouncedMessage)) {
      setIsTyping(false);
      socket.emit("conversation:typing:stop", typingPayload);
    }
  }, [message, debouncedMessage, socket, me, conversationId, isTyping]);

  const clearFileInput = useCallback(() => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if ((!trimmed && !selectedFile) || !me) return;

      let fileUrl: string | null = null;

      if (selectedFile) {
        try {
          fileUrl = await uploadFile(selectedFile);
        } catch (err) {
          console.error("Upload failed", err);
          // Optional: show toast or mark message as failed
          return;
        }
      }

      const tempId = `msg-${Date.now()}`;
      const optimisticMessage: PendingMessage = {
        tempId,
        senderId: me.id,
        conversationId,
        content: fileUrl ?? trimmed,
        type: selectedFile ? "image" : "text",
        status: "pending",
        timestamp: new Date()
      };

      addMessageToCache({ queryClient, conversationId, message: optimisticMessage });

      await updateConversationPreview({
        queryClient,
        conversationId,
        buildPreview: (old) => ({
          lastMessage: {
            id: "",
            senderId: me.id,
            senderName: me.fullname,
            content: selectedFile ? "You sent a photo" : trimmed,
            type: selectedFile ? "image" : "text",
            timestamp: new Date()
          },
          sortTimestamp: new Date()
        }),
        fetchConversation: getConversationById
      });

      if (!socket) {
        console.warn("Socket disconnected — message not sent");
        return;
      }

      socket.emit(
        "conversation:message:create",
        { ...optimisticMessage },
        (callbackMessage: CallbackMessage) => {
          queryClient.setQueryData<InfiniteData<MessagesPage>>(
            ["messages", conversationId],
            (old) => {
              if (!old) return old;

              return {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  data: page.data.map((m) =>
                    "tempId" in m && m.tempId === callbackMessage.tempId ? callbackMessage : m
                  )
                }))
              };
            }
          );
        }
      );

      setMessage("");
      clearFileInput();
    },
    [conversationId, queryClient, selectedFile, socket, clearFileInput, me]
  );

  // 🖼️ Handle file input
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        clearFileInput();
      }
    },
    [clearFileInput]
  );

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  // 🚀 Submit handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSendMessage(message);
    },
    [handleSendMessage, message]
  );

  return (
    <div className="bg-card text-card-foreground flex w-full flex-1 flex-col p-4">
      {imagePreview && (
        <div className="border-border relative mb-4 overflow-hidden rounded-lg border">
          <img
            src={imagePreview}
            alt="Preview"
            className="bg-muted max-h-48 w-full object-contain"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="bg-background/60 absolute top-2 right-2 rounded-full"
            onClick={clearFileInput}
          >
            <XCircle className="text-muted-foreground h-5 w-5" />
          </Button>
        </div>
      )}
      <div className="flex w-full items-center">
        <input
          id="file-input"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground mr-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <form onSubmit={handleSubmit} className="flex w-full items-center">
          <Input
            id="message-input"
            placeholder="Type your message..."
            className="mr-2 grow"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(message);
              }
            }}
            readOnly={!!imagePreview}
          />
          <div className="flex items-center gap-2">
            <EmojiPicker onSelect={handleEmojiSelect} className="bg-background border-none" />

            <Button type="submit" size="icon" disabled={!message.trim() && !selectedFile}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});
