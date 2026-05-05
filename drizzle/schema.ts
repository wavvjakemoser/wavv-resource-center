import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: text("passwordHash"),
  isActive: boolean("isActive").default(true).notNull(),
  role: mysqlEnum("role", ["user", "admin", "super_admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  avatarUrl: text("avatarUrl"),
  googleId: varchar("googleId", { length: 255 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Academy Courses ──────────────────────────────────────────────────────────
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "Onboarding",
    "How-To",
    "Strategy and Best Practices",
    "Dialer Setup",
    "CRM Integrations",
    "Spam Protection",
  ]).notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  durationMinutes: int("durationMinutes").default(0),
  sortOrder: int("sortOrder").default(0),
  published: boolean("published").default(true).notNull(),
  // Admin-applied tags, comma-separated (e.g. "Most Popular,Featured")
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;

// ─── Academy Lessons ──────────────────────────────────────────────────────────
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: text("videoUrl"),
  durationMinutes: int("durationMinutes").default(0),
  sortOrder: int("sortOrder").default(0),
  published: boolean("published").default(true).notNull(),
  // Admin-only: reason why content was deactivated (e.g. "Outdated", "Feature removed", "Needs update")
  inactiveReason: varchar("inactiveReason", { length: 255 }),
  // Admin-applied tags, comma-separated (e.g. "Most Popular,Must Watch,New")
  tags: text("tags"),
  // Admin star: marks lesson as featured/starred in the Academy
  starred: boolean("starred").default(false).notNull(),
  // Admin hide: quick visibility toggle (separate from published/deactivate flow)
  hidden: boolean("hidden").default(false).notNull(),
  // Admin-set file URL for downloadable resources (PDF, etc.)
  fileUrl: text("fileUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;

// ─── Lesson Progress ──────────────────────────────────────────────────────────
export const lessonProgress = mysqlTable("lesson_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  courseId: int("courseId").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LessonProgress = typeof lessonProgress.$inferSelect;

// ─── Webinars ─────────────────────────────────────────────────────────────────
export const webinars = mysqlTable("webinars", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  host: varchar("host", { length: 255 }),
  type: mysqlEnum("type", ["upcoming", "recording", "exclusive", "evergreen"]).notNull(),
  scheduledAt: timestamp("scheduledAt"),
  registrationUrl: text("registrationUrl"),
  videoUrl: text("videoUrl"),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  accentColor: varchar('accent_color', { length: 20 }),
  viewCount: int("viewCount").default(0),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Webinar = typeof webinars.$inferSelect;

// ─── Webinar Registrations ────────────────────────────────────────────────────
export const webinarRegistrations = mysqlTable("webinar_registrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  webinarId: int("webinarId").notNull(),
  registeredAt: timestamp("registeredAt").defaultNow().notNull(),
});

// ─── Guides & Docs ────────────────────────────────────────────────────────────
export const guides = mysqlTable("guides", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  fileUrl: text("fileUrl"),
  fileType: mysqlEnum("fileType", ["pdf", "checklist", "playbook", "other"]).default("pdf"),
  downloadCount: int("downloadCount").default(0),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Guide = typeof guides.$inferSelect;

// ─── Support Tickets ──────────────────────────────────────────────────────────
export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  category: mysqlEnum("category", [
    "Technical Issue",
    "Billing",
    "Feature Request",
    "Onboarding",
    "General Question",
    "Other",
  ]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;

// ─── Analytics Events ─────────────────────────────────────────────────────────
export const analyticsEvents = mysqlTable("analytics_events", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId"),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  resourceType: varchar("resourceType", { length: 50 }),
  resourceId: int("resourceId"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// ─── Bookmarks ────────────────────────────────────────────────────────────────
export const bookmarks = mysqlTable("bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Content type: "lesson" | "webinar" | "guide"
  contentType: varchar("contentType", { length: 50 }).notNull(),
  // The ID of the bookmarked item (lessonId, webinarId, or guideId)
  contentId: int("contentId").notNull(),
  // Denormalized title for quick display without joins
  contentTitle: varchar("contentTitle", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Bookmark = typeof bookmarks.$inferSelect;

// ─── Playground Feature Requests ───────────────────────────────────────────────
export const playgroundRequests = mysqlTable("playground_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull(),
  playground: varchar("playground", { length: 255 }).notNull(),
  optIn: boolean("optIn").default(true).notNull(),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PlaygroundRequest = typeof playgroundRequests.$inferSelect;

// ─── Content Requests ─────────────────────────────────────────────────────────
export const contentRequests = mysqlTable("content_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Type of content being requested
  requestType: mysqlEnum("requestType", ["video", "guide", "webinar"]).notNull(),
  // Topic / title of the requested content
  topic: varchar("topic", { length: 255 }).notNull(),
  // Detailed description of what they want to learn / cover
  description: text("description"),
  // Category context (varies by request type)
  category: varchar("category", { length: 100 }),
  // Format preference (varies by request type)
  formatPreference: varchar("formatPreference", { length: 100 }),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentRequest = typeof contentRequests.$inferSelect;

// ─── Page Readiness Checklist (Admin Only) ────────────────────────────────────
export const pageReadinessItems = mysqlTable("page_readiness_items", {
  id: int("id").autoincrement().primaryKey(),
  page: mysqlEnum("page", ["academy", "webinars", "guides", "playground", "support"]).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  checked: boolean("checked").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PageReadinessItem = typeof pageReadinessItems.$inferSelect;
