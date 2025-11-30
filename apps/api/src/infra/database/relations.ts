import { relations } from "drizzle-orm";
import { users, conversations, conversationParticipants, messages } from "./schema"; // adjust path as needed

export const usersRelations = relations(users, ({ many }) => ({
  conversationsCreated: many(conversations, { relationName: "creator" }),
  messages: many(messages, { relationName: "sentMessages" }),
  conversationParticipants: many(conversationParticipants)
}));

export const conversationsRelations = relations(conversations, ({ many, one }) => ({
  createdBy: one(users, {
    fields: [conversations.createdBy],
    references: [users.id],
    relationName: "creator"
  }),
  messages: many(messages),
  participants: many(conversationParticipants)
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id]
  }),
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id]
  })
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages"
  }),
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id]
  })
}));
