import {
  boolean,
  int,
  mediumtext,
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
  passwordHash: text("password_hash"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: bigint("password_reset_expires", { mode: "number" }),
  isActive: boolean("isActive").default(true).notNull(),
  role: mysqlEnum("role", ["user", "viewer", "publisher", "partner_manager", "partner", "owner"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  avatarUrl: text("avatarUrl"),
  googleId: varchar("googleId", { length: 255 }),
  strikes: int("strikes").default(0).notNull(),
  // MFA (TOTP / Google Authenticator)
  mfaSecret: text("mfa_secret"),
  mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
  mfaSetupToken: text("mfa_setup_token"),
  mfaSetupTokenExpiresAt: bigint("mfa_setup_token_expires_at", { mode: "number" }),
  // Force re-enrollment: when true, user must complete MFA setup again before accessing the app
  mfaForceReenroll: boolean("mfa_force_reenroll").default(false).notNull(),
  // WAVV IdP token claims
  wavvSub: varchar("wavv_sub", { length: 128 }),           // stable sub from IdP (employee:<id> / customer:<id> / guest:<id>)
  accountType: mysqlEnum("account_type", ["employee", "customer", "guest"]).default("guest").notNull(),
  approvalStatus: mysqlEnum("approval_status", ["pending", "approved", "denied"]).default("pending").notNull(),
  isEmployee: boolean("is_employee").default(false).notNull(),
  isCustomer: boolean("is_customer").default(false).notNull(),
  // Customer-specific metadata (null for employees and guests)
  wavvAccountId: varchar("wavv_account_id", { length: 128 }),
  subscriptionStatus: varchar("subscription_status", { length: 64 }),  // NONE | INCOMPLETE | TRIALING | ACTIVE | SCHEDULED_CANCEL | CANCELED
  wavvPlan: varchar("wavv_plan", { length: 128 }),
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
  durationSeconds: int("durationSeconds").default(0),
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
  // Pop-out (Picture-in-Picture) enabled for this lesson
  pipEnabled: boolean("pipEnabled").default(true).notNull(),
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
  iconName: varchar('icon_name', { length: 50 }),
  viewCount: int("viewCount").default(0),
  sortOrder: int("sortOrder").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  // Pop-out (Picture-in-Picture) enabled for this webinar
  pipEnabled: boolean("pipEnabled").default(true).notNull(),
  // Coming Soon flag — hides video/register and shows Coming Soon banner
  comingSoon: boolean("comingSoon").default(false).notNull(),
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
  linkLabel: varchar("linkLabel", { length: 255 }),
  fileType: mysqlEnum("fileType", ["pdf", "checklist", "playbook", "other", "help_article"]).default("pdf"),
  downloadCount: int("downloadCount").default(0),
  sortOrder: int("sortOrder").default(0).notNull(),
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
  requestType: mysqlEnum("requestType", ["video", "guide", "webinar", "search_query"]).notNull(),
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

// ─── User Notifications ───────────────────────────────────────────────────────
export const userNotifications = mysqlTable("user_notifications", {
  id: int("id").autoincrement().primaryKey(),
  // null = broadcast to all users; non-null = targeted to specific user
  userId: int("userId"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning", "announcement"]).default("info").notNull(),
  link: varchar("link", { length: 500 }),
  linkLabel: varchar("linkLabel", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  // Tracks which users have dismissed/read this notification (stored as JSON array of userIds)
});
export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = typeof userNotifications.$inferInsert;

// ─── Notification Reads ───────────────────────────────────────────────────────
export const notificationReads = mysqlTable("notification_reads", {
  id: int("id").autoincrement().primaryKey(),
  notificationId: int("notificationId").notNull(),
  userId: int("userId").notNull(),
  readAt: timestamp("readAt").defaultNow().notNull(),
});
export type NotificationRead = typeof notificationReads.$inferSelect;

// ─── Invite Tokens ──────────────────────────────────────────────────────────
export const inviteTokens = mysqlTable("invite_tokens", {
  id: int("id").autoincrement().primaryKey(),
  // Email address the invite was sent to
  email: varchar("email", { length: 320 }).notNull(),
  // Name pre-filled for the invitee (optional)
  name: varchar("name", { length: 255 }),
  // Secure random token (UUID or crypto hex)
  token: varchar("token", { length: 128 }).notNull().unique(),
  // Role to assign on account creation
  role: mysqlEnum("role", ["user", "viewer", "publisher", "partner_manager", "partner", "owner"]).default("user").notNull(),
  // Whether the invite has been claimed
  used: boolean("used").default(false).notNull(),
  // Token expiry (72 hours from creation)
  expiresAt: timestamp("expiresAt").notNull(),
  // Admin who created the invite
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InviteToken = typeof inviteTokens.$inferSelect;

// ─── Section Resources (standalone PDFs attached to a course/section) ──────────
export const sectionResources = mysqlTable("section_resources", {
  id: int("id").autoincrement().primaryKey(),
  // courseId links to the courses table (a "section" in Academy parlance)
  courseId: int("courseId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isHidden: boolean("isHidden").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SectionResource = typeof sectionResources.$inferSelect;

// ─── Site Settings ────────────────────────────────────────────────────────────
// Key-value store for admin-controlled feature flags and visibility settings.
// Each row is a single setting. Values are stored as JSON strings.
export const siteSettings = mysqlTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(), // JSON string
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SiteSetting = typeof siteSettings.$inferSelect;

// ─── Magic Link Tokens ────────────────────────────────────────────────────────
// Single-use tokens for passwordless login and team member invites.
export const magicLinkTokens = mysqlTable("magic_link_tokens", {
  id: int("id").autoincrement().primaryKey(),
  // userId is null for pending invites (user not yet created)
  userId: int("userId"),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  // 'login' = existing user requesting access, 'invite' = new team member invite
  type: mysqlEnum("type", ["login", "invite"]).default("login").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MagicLinkToken = typeof magicLinkTokens.$inferSelect;

// ─── Intercom Help Article Collections ───────────────────────────────────────
export const helpArticleCollections = mysqlTable("help_article_collections", {
  id: int("id").autoincrement().primaryKey(),
  // Intercom collection ID (string to avoid bigint issues)
  intercomId: varchar("intercom_id", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // Admin visibility toggle — hide entire collection from public
  visible: boolean("visible").default(true).notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HelpArticleCollection = typeof helpArticleCollections.$inferSelect;

// ─── Intercom Help Articles ───────────────────────────────────────────────────
export const helpArticles = mysqlTable("help_articles", {
  id: int("id").autoincrement().primaryKey(),
  // Intercom article ID
  intercomId: varchar("intercom_id", { length: 64 }).notNull().unique(),
  collectionId: varchar("collection_id", { length: 64 }),
  title: varchar("title", { length: 500 }).notNull(),
  // Full HTML body from Intercom
  body: text("body"),
  // Plain text summary (first ~200 chars stripped of HTML)
  summary: text("summary"),
  // Direct URL to article on Intercom Help Center
  url: text("url"),
  // Admin visibility toggle — hide individual article from public
  visible: boolean("visible").default(true).notNull(),
  // Intercom article state: published | draft
  state: varchar("state", { length: 32 }).default("published"),
  // Author name from Intercom
  authorName: varchar("author_name", { length: 255 }),
  // When the article was last updated in Intercom
  intercomUpdatedAt: bigint("intercom_updated_at", { mode: "number" }),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HelpArticle = typeof helpArticles.$inferSelect;

// ─── Partner Content ──────────────────────────────────────────────────────────
// Stores editable content blocks for /partners (public) and /wavvpartner (portal)
export const partnerContent = mysqlTable("partner_content", {
  id: int("id").autoincrement().primaryKey(),
  // 'public' = /partners page, 'portal' = /wavvpartner page
  pageTarget: mysqlEnum("pageTarget", ["public", "portal"]).notNull(),
  // Content block type
  blockType: mysqlEnum("blockType", ["hero", "module", "resource_card", "quick_link"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  // URL for resource cards and quick links
  linkUrl: varchar("linkUrl", { length: 500 }),
  // For modules: 'coming_soon' | 'live'
  status: mysqlEnum("status", ["coming_soon", "live"]).default("coming_soon"),
  // For resource cards: whether the card is locked/unlocked
  isLocked: boolean("isLocked").default(true).notNull(),
  // Display order within its block type + page
  sortOrder: int("sortOrder").default(0).notNull(),
  // Whether this block is visible
  isVisible: boolean("isVisible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PartnerContent = typeof partnerContent.$inferSelect;

// ─── Published Help Articles (customer-facing) ────────────────────────────────
// Tracks articles published to the customer-facing Guides & Docs "Help Articles" section.
// source='intercom': synced from Intercom, published by admin
// source='native': authored directly in the portal admin (never shown to customers)
export const publishedHelpArticles = mysqlTable("published_help_articles", {
  id: int("id").autoincrement().primaryKey(),
  // 'intercom' = synced from Intercom; 'native' = authored directly in the portal (admin-only flag)
  source: mysqlEnum("source", ["intercom", "native"]).default("intercom").notNull(),
  // References helpArticles.intercomId — null for native articles
  intercomArticleId: varchar("intercom_article_id", { length: 64 }).unique(),
  // Denormalized for fast reads without joins
  title: varchar("title", { length: 500 }).notNull(),
  url: text("url"),
  // Full HTML body for native (portal-authored) articles; also used for Intercom body cache
  nativeBody: mediumtext("native_body"),
  // Author name for native articles (admin-only, never shown to customers)
  nativeAuthorName: varchar("native_author_name", { length: 255 }),
  // Section name shown on the customer-facing page (e.g. "Dialer Settings")
  sectionName: varchar("section_name", { length: 255 }).notNull().default("General"),
  // Sort order within the section (lower = first)
  sortOrder: int("sort_order").default(0).notNull(),
  // Sort order of the section itself (lower = first section shown)
  sectionOrder: int("section_order").default(0).notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PublishedHelpArticle = typeof publishedHelpArticles.$inferSelect;
export type InsertPublishedHelpArticle = typeof publishedHelpArticles.$inferInsert;

// ─── Help Article Sections ────────────────────────────────────────────────────
// Admin-created named sections for the customer-facing Help Articles panel.
// Articles are published into these sections from the Synced Help Articles panel.
export const helpArticleSections = mysqlTable("help_article_sections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  sortOrder: int("sort_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HelpArticleSection = typeof helpArticleSections.$inferSelect;
export type InsertHelpArticleSection = typeof helpArticleSections.$inferInsert;
// ─── PDF Sections ─────────────────────────────────────────────────────────────
// Admin-created named sections for the customer-facing PDFs panel.
// PDFs are assigned to these sections via the `category` field on guides.
export const pdfSections = mysqlTable("pdf_sections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  sortOrder: int("sort_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PdfSection = typeof pdfSections.$inferSelect;
export type InsertPdfSection = typeof pdfSections.$inferInsert;

// ─── FAQ Sections ─────────────────────────────────────────────────────────────
export const faqSections = mysqlTable("faq_sections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  sortOrder: int("sort_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FaqSection = typeof faqSections.$inferSelect;
export type InsertFaqSection = typeof faqSections.$inferInsert;

// ─── FAQ Entries ──────────────────────────────────────────────────────────────
export const faqEntries = mysqlTable("faq_entries", {
  id: int("id").autoincrement().primaryKey(),
  sectionId: int("section_id").notNull(),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  fileUrl: varchar("file_url", { length: 1024 }),
  fileName: varchar("file_name", { length: 255 }),
  sortOrder: int("sort_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FaqEntry = typeof faqEntries.$inferSelect;
export type InsertFaqEntry = typeof faqEntries.$inferInsert;

// ─── Accelerator Sessions ────────────────────────────────────────────────────
export const acceleratorSessions = mysqlTable("accelerator_sessions", {
  id: int("id").autoincrement().primaryKey(),
  week: int("week").notNull(), // 1-6
  title: varchar("title", { length: 255 }).notNull(),
  wavvFocus: text("wavv_focus"),
  outcome: text("outcome"),
  color: varchar("color", { length: 32 }).default("#0074F4").notNull(),
  // Landing page content (rich text / markdown)
  heroHeadline: varchar("hero_headline", { length: 255 }),
  heroSubline: text("hero_subline"),
  bodyContent: mediumtext("body_content"), // markdown or HTML for the session landing page
  videoUrl: text("video_url"), // optional embedded video
  resourceLinks: text("resource_links"), // JSON array of { label, url }
  isPublished: boolean("is_published").default(false).notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AcceleratorSession = typeof acceleratorSessions.$inferSelect;
export type InsertAcceleratorSession = typeof acceleratorSessions.$inferInsert;
