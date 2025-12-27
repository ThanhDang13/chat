import {
  pgTable,
  serial,
  text,
  bigint,
  unique,
  uuid,
  timestamp,
  pgEnum,
  boolean,
  index
} from "drizzle-orm/pg-core";

export const userRoles = pgEnum("user_roles", ["admin", "user"]);
export const userStatuses = pgEnum("user_statuses", ["active", "inactive", "deleted"]);
export const messageTypes = pgEnum("message_types", ["text", "image", "icon"]);

export const drizzleMigrations = pgTable("__drizzle_migrations", {
  id: serial().primaryKey().notNull(),
  hash: text().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  createdAt: bigint("created_at", { mode: "number" })
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullname: text("full_name").notNull(),
  password: text("password").notNull(),
  avatar: text("avatar").default(""),
  bio: text("bio").default("").notNull(),
  createdAt: timestamp({ mode: "date" }).defaultNow(),
  updatedAt: timestamp({ mode: "date" }).defaultNow()
});

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  mutedAll: boolean("muted_all").default(false),
  theme: text("theme").default("system")
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  isGroup: boolean("is_group").default(false).notNull(),
  name: text("name"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp({ mode: "date" }).defaultNow(),
  updatedAt: timestamp({ mode: "date" }).defaultNow()
});

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    isGroup: boolean("is_group").default(false).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").default("member"),
    joinedAt: timestamp({ mode: "date" }).defaultNow(),
    muted: boolean("muted").default(false).notNull(),
    lastReadMessageId: uuid("last_read_message_id")
  },
  (table) => [unique("conversation_participants_pk").on(table.conversationId, table.userId)]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content"),
    type: messageTypes("type").notNull().default("text"),
    timestamp: timestamp("timestamp", { mode: "date" }).defaultNow()
  },
  (table) => [index("idx_id").on(table.id)]
);
