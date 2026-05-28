import { and, asc, desc, eq, gt, gte, lt, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analyticsEvents,
  bookmarks,
  contentRequests,
  courses,
  guides,
  InsertUser,
  lessonProgress,
  lessons,
  playgroundRequests,
  supportTickets,
  users,
  webinarRegistrations,
  webinars,
  pageReadinessItems,
  userNotifications,
  notificationReads,
  siteSettings,
  inviteTokens,
  magicLinkTokens,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "super_admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}
export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(users).where(eq(users.id, userId));
}
export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  // Fetch the user
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;
  // Fetch all progress rows for this user
  const progress = await db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
  const lessonsStarted = progress.length;
  const lessonsCompleted = progress.filter(p => p.completed).length;
  // Distinct courses started
  const courseIdSet = new Set<number>();
  progress.forEach(p => courseIdSet.add(p.courseId));
  const courseIds = Array.from(courseIdSet);
  const coursesStarted = courseIds.length;
  // Courses completed: need to know total lessons per course
  // We'll just return what we have; the UI can show started/completed lessons
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    lastSignedIn: user.lastSignedIn,
    lessonsStarted,
    lessonsCompleted,
    coursesStarted,
  };
}

// ─── Academy: Courses ─────────────────────────────────────────────────────────
export async function getCourses(publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(courses);
  if (publishedOnly) {
    return query.where(eq(courses.published, true)).orderBy(courses.sortOrder, courses.createdAt);
  }
  return query.orderBy(courses.sortOrder, courses.createdAt);
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result[0];
}

export async function createCourse(data: {
  title: string;
  description?: string;
  category: typeof courses.$inferInsert["category"];
  thumbnailUrl?: string;
  durationMinutes?: number;
  sortOrder?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(courses).values({ ...data, published: true });
  return result;
}

export async function updateCourse(id: number, data: Partial<typeof courses.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(courses).set(data).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(courses).where(eq(courses.id, id));
}

// ─── Academy: Lessons ─────────────────────────────────────────────────────────
export async function getLessonsByCourse(courseId: number, publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const conditions = publishedOnly
    ? and(eq(lessons.courseId, courseId), eq(lessons.published, true), eq(lessons.hidden, false))
    : eq(lessons.courseId, courseId);
  return db.select().from(lessons).where(conditions).orderBy(lessons.sortOrder, lessons.createdAt);
}

export async function getLessonsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  // Join lessons through courses filtered by category
  const categoryCourses = await db
    .select()
    .from(courses)
    .where(and(eq(courses.category, category as any), eq(courses.published, true)));
  if (categoryCourses.length === 0) return [];
  const courseIds = categoryCourses.map((c) => c.id);
  const allLessons = await Promise.all(
    courseIds.map((id) => getLessonsByCourse(id, true))
  );
  return allLessons.flat();
}

export async function getLessonById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return result[0];
}

export async function createLesson(data: {
  courseId: number;
  title: string;
  description?: string;
  videoUrl?: string;
  durationMinutes?: number;
  sortOrder?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(lessons).values({ ...data, published: true });
}

export async function updateLesson(id: number, data: Partial<typeof lessons.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(lessons).set(data).where(eq(lessons.id, id));
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(lessons).where(eq(lessons.id, id));
}

// ─── Academy: Progress ────────────────────────────────────────────────────────
export async function getUserProgress(userId: number, courseId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = courseId
    ? and(eq(lessonProgress.userId, userId), eq(lessonProgress.courseId, courseId))
    : eq(lessonProgress.userId, userId);
  return db.select().from(lessonProgress).where(conditions);
}

/**
 * Called when a user opens a lesson (clicks Watch). Creates an in-progress row if none exists.
 * Does NOT overwrite a completed row — preserves completion state.
 */
export async function touchLessonProgress(userId: number, lessonId: number, courseId: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);
  if (existing.length === 0) {
    // No row yet — insert an in-progress (not completed) row so it shows in Continue Learning
    await db.insert(lessonProgress).values({
      userId,
      lessonId,
      courseId,
      completed: false,
    });
  }
  // If row exists (completed or in-progress), leave it untouched
}

export async function markLessonComplete(userId: number, lessonId: number, courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(lessonProgress)
      .set({ completed: true, completedAt: new Date() })
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
  } else {
    await db.insert(lessonProgress).values({
      userId,
      lessonId,
      courseId,
      completed: true,
      completedAt: new Date(),
    });
  }
}

export async function getCourseCompletionStats() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      courseId: lessonProgress.courseId,
      completedCount: sql<number>`COUNT(DISTINCT ${lessonProgress.userId})`,
    })
    .from(lessonProgress)
    .where(eq(lessonProgress.completed, true))
    .groupBy(lessonProgress.courseId);
}

// ─── Webinars ─────────────────────────────────────────────────────────────────
export async function getWebinars(type?: "upcoming" | "recording" | "exclusive" | "evergreen") {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  // For exclusive webinars (user-facing): only show future/current sessions (scheduledAt > now)
  if (type === "exclusive") {
    return db.select().from(webinars).where(
      and(eq(webinars.type, "exclusive"), eq(webinars.published, true), gt(webinars.scheduledAt, now))
    ).orderBy(asc(webinars.scheduledAt));
  }
  const conditions = type
    ? and(eq(webinars.type, type), eq(webinars.published, true))
    : eq(webinars.published, true);
  return db.select().from(webinars).where(conditions).orderBy(desc(webinars.scheduledAt));
}

export async function getArchivedExclusiveWebinars() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  // Exclusive webinars whose scheduled time has passed (archived, regardless of published flag)
  return db.select().from(webinars).where(
    and(eq(webinars.type, "exclusive"), lt(webinars.scheduledAt, now))
  ).orderBy(desc(webinars.scheduledAt));
}

export async function getWebinarById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(webinars).where(eq(webinars.id, id)).limit(1);
  return result[0];
}

export async function createWebinar(data: typeof webinars.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(webinars).values(data);
}

export async function updateWebinar(id: number, data: Partial<typeof webinars.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(webinars).set(data).where(eq(webinars.id, id));
}

export async function deleteWebinar(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(webinars).where(eq(webinars.id, id));
}

export async function registerForWebinar(userId: number, webinarId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db
    .select()
    .from(webinarRegistrations)
    .where(
      and(
        eq(webinarRegistrations.userId, userId),
        eq(webinarRegistrations.webinarId, webinarId)
      )
    )
    .limit(1);
  if (existing.length > 0) return { alreadyRegistered: true };
  await db.insert(webinarRegistrations).values({ userId, webinarId });
  await db
    .update(webinars)
    .set({ viewCount: sql`${webinars.viewCount} + 1` })
    .where(eq(webinars.id, webinarId));
  return { alreadyRegistered: false };
}

export async function getUserWebinarRegistrations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(webinarRegistrations)
    .where(eq(webinarRegistrations.userId, userId));
}

export async function incrementWebinarView(webinarId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(webinars)
    .set({ viewCount: sql`${webinars.viewCount} + 1` })
    .where(eq(webinars.id, webinarId));
}

// ─── Guides ───────────────────────────────────────────────────────────────────
export async function getGuides(publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(guides);
  if (publishedOnly) return query.where(eq(guides.published, true)).orderBy(desc(guides.createdAt));
  return query.orderBy(desc(guides.createdAt));
}

export async function getGuideById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(guides).where(eq(guides.id, id)).limit(1);
  return result[0];
}

export async function createGuide(data: typeof guides.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.insert(guides).values(data);
}

export async function updateGuide(id: number, data: Partial<typeof guides.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(guides).set(data).where(eq(guides.id, id));
}

export async function deleteGuide(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(guides).where(eq(guides.id, id));
}

export async function incrementGuideDownload(guideId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(guides)
    .set({ downloadCount: sql`${guides.downloadCount} + 1` })
    .where(eq(guides.id, guideId));
}

// ─── Support Tickets ──────────────────────────────────────────────────────────
export async function createSupportTicket(data: typeof supportTickets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(supportTickets).values(data);
  return result;
}

export async function getUserTickets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt));
}

export async function getAllTickets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
}

export async function updateTicketStatus(
  id: number,
  status: "open" | "in_progress" | "resolved" | "closed"
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(supportTickets).set({ status }).where(eq(supportTickets.id, id));
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function trackEvent(data: {
  userId?: number;
  eventType: string;
  resourceType?: string;
  resourceId?: number;
  metadata?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analyticsEvents).values(data);
}
export async function clearAllAnalytics() {
  const db = await getDb();
  if (!db) return;
  await db.delete(analyticsEvents);
}

export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) return null;

  const [totalUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  const [totalTickets] = await db.select({ count: sql<number>`COUNT(*)` }).from(supportTickets);
  const [completedLessons] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(lessonProgress)
    .where(eq(lessonProgress.completed, true));
  const [totalWebinarViews] = await db
    .select({ total: sql<number>`SUM(viewCount)` })
    .from(webinars);

  return {
    totalUsers: totalUsers?.count ?? 0,
    totalTickets: totalTickets?.count ?? 0,
    completedLessons: completedLessons?.count ?? 0,
    totalWebinarViews: totalWebinarViews?.total ?? 0,
  };
}

// ─── Advanced Analytics Queries ──────────────────────────────────────────────

/** Get event counts grouped by eventType within a date range */
export async function getEventCountsByType(sinceDate: Date) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      eventType: analyticsEvents.eventType,
      count: sql<number>`COUNT(*)`,
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, sinceDate))
    .groupBy(analyticsEvents.eventType);
  return rows;
}

/** Get daily event counts for a specific event type (for charts) */
export async function getDailyEventCounts(eventType: string, sinceDate: Date) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      date: sql<string>`DATE(createdAt)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.eventType, eventType), gte(analyticsEvents.createdAt, sinceDate)))
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);
  return rows;
}

/** Get unique active users (users with any event) within a date range */
export async function getActiveUsers(sinceDate: Date) {
  const db = await getDb();
  if (!db) return { count: 0 };
  const [result] = await db
    .select({ count: sql<number>`COUNT(DISTINCT userId)` })
    .from(analyticsEvents)
    .where(and(gte(analyticsEvents.createdAt, sinceDate), sql`userId IS NOT NULL`));
  return { count: result?.count ?? 0 };
}

/** Get top content by views/interactions */
export async function getTopContent(sinceDate: Date, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      resourceType: analyticsEvents.resourceType,
      resourceId: analyticsEvents.resourceId,
      eventType: analyticsEvents.eventType,
      count: sql<number>`COUNT(*)`,
    })
    .from(analyticsEvents)
    .where(
      and(
        gte(analyticsEvents.createdAt, sinceDate),
        sql`resourceId IS NOT NULL`
      )
    )
    .groupBy(analyticsEvents.resourceType, analyticsEvents.resourceId, analyticsEvents.eventType)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(limit);
  return rows;
}

/** Get sign-in trend (daily logins) */
export async function getSignInTrend(sinceDate: Date) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      date: sql<string>`DATE(createdAt)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.eventType, "login"), gte(analyticsEvents.createdAt, sinceDate)))
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);
  return rows;
}

/** Get detail rows for a specific event type (or multiple), joined with user info */
export async function getStatDetail(
  eventTypes: string[],
  sinceDate: Date,
  limit = 200
) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: analyticsEvents.id,
      eventType: analyticsEvents.eventType,
      resourceType: analyticsEvents.resourceType,
      resourceId: analyticsEvents.resourceId,
      metadata: analyticsEvents.metadata,
      createdAt: analyticsEvents.createdAt,
      userId: analyticsEvents.userId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(analyticsEvents)
    .leftJoin(users, eq(analyticsEvents.userId, users.id))
    .where(
      and(
        gte(analyticsEvents.createdAt, sinceDate),
        sql`${analyticsEvents.eventType} IN (${sql.join(
          eventTypes.map((t) => sql`${t}`),
          sql`, `
        )})`
      )
    )
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(limit);
  return rows;
}

/** Get all events for a time range (paginated) */
export async function getRecentEvents(sinceDate: Date, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, sinceDate))
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(limit);
  return rows;
}

// ─── Native Auth Helpers ──────────────────────────────────────────────────────
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function createNativeUser(data: {
  email: string;
  name: string;
  passwordHash: string | null;
  role?: "user" | "admin" | "super_admin";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const openId = `native_${data.email}_${Date.now()}`;
  await db.insert(users).values({
    openId,
    email: data.email,
    name: data.name,
    passwordHash: data.passwordHash,
    loginMethod: "native",
    role: data.role ?? "user",
    isActive: true,
    lastSignedIn: new Date(),
  });
  const created = await getUserByEmail(data.email);
  if (!created) throw new Error("Failed to create user");
   return created;
}

export async function upsertGoogleUser(data: {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if user exists by googleId or email
  const byGoogle = await db.select().from(users).where(eq(users.googleId, data.googleId)).limit(1);
  if (byGoogle[0]) {
    // Update last signed in and avatar
    await db.update(users).set({ lastSignedIn: new Date(), avatarUrl: data.avatarUrl ?? byGoogle[0].avatarUrl }).where(eq(users.id, byGoogle[0].id));
    return byGoogle[0];
  }
  const byEmail = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (byEmail[0]) {
    // Link Google ID to existing account
    await db.update(users).set({ googleId: data.googleId, lastSignedIn: new Date(), avatarUrl: data.avatarUrl ?? byEmail[0].avatarUrl }).where(eq(users.id, byEmail[0].id));
    return byEmail[0];
  }
  // Create new user
  const openId = `google_${data.googleId}`;
  await db.insert(users).values({
    openId,
    email: data.email,
    name: data.name,
    googleId: data.googleId,
    avatarUrl: data.avatarUrl,
    loginMethod: "google",
    role: "user",
    isActive: true,
    lastSignedIn: new Date(),
  });
  const created = await getUserByEmail(data.email);
  if (!created) throw new Error("Failed to create Google user");
  return created;
}

// ─── Search ──────────────────────────────────────────────────────────────────
export async function searchContent(query: string) {
  const db = await getDb();
  if (!db) return { courses: [], lessons: [], webinars: [], guides: [] };
  const q = `%${query.toLowerCase()}%`;

  const [matchedCourses, matchedLessons, matchedWebinars, matchedGuides] = await Promise.all([
    db.select().from(courses).where(
      and(eq(courses.published, true), or(like(courses.title, q), like(courses.description, q)))
    ).limit(5),
    db.select().from(lessons).where(
      and(eq(lessons.published, true), or(like(lessons.title, q), like(lessons.description, q)))
    ).limit(8),
    db.select().from(webinars).where(
      or(like(webinars.title, q), like(webinars.description, q))
    ).limit(5),
    db.select().from(guides).where(
      and(eq(guides.published, true), or(like(guides.title, q), like(guides.description, q)))
    ).limit(5),
  ]);

  return {
    courses: matchedCourses,
    lessons: matchedLessons,
    webinars: matchedWebinars,
    guides: matchedGuides,
  };
}

// ─── Trophy Case ─────────────────────────────────────────────────────────────
export async function getUserTrophies(userId: number) {
  const db = await getDb();
  if (!db) return { completedCourses: [], totalLessons: 0, badges: [] };

  // Get all completed lessons for this user (exclude in-progress rows)
  const progress = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.completed, true)));
  const totalLessonsCompleted = progress.length;

  // Get courses where all lessons are completed
  const allCourses = await getCourses(true);
  const completedCourseIds: number[] = [];

  for (const course of allCourses) {
    const courseLessons = await getLessonsByCourse(course.id, true);
    if (courseLessons.length === 0) continue;
    const completedInCourse = progress.filter(p => p.courseId === course.id).length;
    if (completedInCourse >= courseLessons.length) {
      completedCourseIds.push(course.id);
    }
  }

  const completedCourses = allCourses.filter(c => completedCourseIds.includes(c.id));

  // Compute badges
  const badges: Array<{ id: string; label: string; icon: string; earned: boolean; description: string }> = [
    {
      id: "first_lesson",
      label: "First Step",
      icon: "🎯",
      earned: totalLessonsCompleted >= 1,
      description: "Complete your first lesson",
    },
    {
      id: "five_lessons",
      label: "Getting Started",
      icon: "🚀",
      earned: totalLessonsCompleted >= 5,
      description: "Complete 5 lessons",
    },
    {
      id: "ten_lessons",
      label: "On a Roll",
      icon: "🔥",
      earned: totalLessonsCompleted >= 10,
      description: "Complete 10 lessons",
    },
    {
      id: "first_course",
      label: "Course Champion",
      icon: "🏆",
      earned: completedCourses.length >= 1,
      description: "Complete your first full course",
    },
    {
      id: "three_courses",
      label: "WAVV Expert",
      icon: "⭐",
      earned: completedCourses.length >= 3,
      description: "Complete 3 full courses",
    },
    {
      id: "all_courses",
      label: "WAVV Master",
      icon: "👑",
      earned: completedCourses.length >= allCourses.length && allCourses.length > 0,
      description: "Complete all available courses",
    },
  ];

  return {
    completedCourses,
    totalLessonsCompleted,
    badges,
  };
}

// ─── Profile Helpers ──────────────────────────────────────────────────────────

/** Get recent activity events for a specific user */
export async function getUserActivity(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(analyticsEvents)
    .where(eq(analyticsEvents.userId, userId))
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(limit);
  return rows;
}

/** Update a user's avatar URL */
export async function updateUserAvatar(userId: number, avatarUrl: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ avatarUrl, updatedAt: new Date() }).where(eq(users.id, userId));
}

/** Get a user by ID */
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] ?? null;
}

/** Remove a specific tag from ALL lessons that have it */
export async function removeTagFromAllLessons(tagLabel: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Get all lessons that have this tag
  const allLessons = await db.select({ id: lessons.id, tags: lessons.tags }).from(lessons);
  const toUpdate = allLessons.filter((l) => {
    if (!l.tags) return false;
    return l.tags.split(",").map((t) => t.trim()).includes(tagLabel);
  });
  for (const lesson of toUpdate) {
    const newTags = (lesson.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && t !== tagLabel)
      .join(",");
    await db.update(lessons).set({ tags: newTags || null }).where(eq(lessons.id, lesson.id));
  }
  return { updated: toUpdate.length };
}

/** Get all unique tags currently in use across all lessons */
export async function getAllUsedTags() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ tags: lessons.tags }).from(lessons).where(sql`tags IS NOT NULL AND tags != ''`);
  const tagSet = new Set<string>();
  for (const row of rows) {
    if (row.tags) {
      row.tags.split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => tagSet.add(t));
    }
  }
  return Array.from(tagSet).sort();
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────
export async function getUserBookmarks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));
}

export async function addBookmark(userId: number, contentType: string, contentId: number, contentTitle?: string) {
  const db = await getDb();
  if (!db) return null;
  // Check if already bookmarked
  const existing = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.contentType, contentType), eq(bookmarks.contentId, contentId)));
  if (existing.length > 0) return existing[0];
  await db.insert(bookmarks).values({ userId, contentType, contentId, contentTitle: contentTitle ?? null });
  const inserted = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.contentType, contentType), eq(bookmarks.contentId, contentId)));
  return inserted[0] ?? null;
}

export async function removeBookmark(userId: number, contentType: string, contentId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.contentType, contentType), eq(bookmarks.contentId, contentId)));
}

export async function isBookmarked(userId: number, contentType: string, contentId: number) {
  const db = await getDb();
  if (!db) return false;
  const rows = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.contentType, contentType), eq(bookmarks.contentId, contentId)));
  return rows.length > 0;
}

// ─── Playground Requests ──────────────────────────────────────────────────────
export async function createPlaygroundRequest(data: {
  userId?: number | null;
  name: string;
  lastName?: string | null;
  email: string;
  playground: string;
  optIn?: boolean;
  message?: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(playgroundRequests).values({
    userId: data.userId ?? null,
    name: data.name,
    lastName: data.lastName ?? null,
    email: data.email,
    playground: data.playground,
    optIn: data.optIn ?? true,
    message: data.message ?? null,
  });
}

export async function getPlaygroundRequests() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(playgroundRequests)
    .orderBy(desc(playgroundRequests.createdAt));
}

export async function getPlaygroundStats() {
  const db = await getDb();
  if (!db) return { total: 0, byPlayground: [] as { playground: string; count: number }[] };
  const rows = await db.select().from(playgroundRequests);
  const total = rows.length;
  const counts: Record<string, number> = {};
  for (const r of rows) {
    counts[r.playground] = (counts[r.playground] ?? 0) + 1;
  }
  const byPlayground = Object.entries(counts)
    .map(([playground, count]) => ({ playground, count }))
    .sort((a, b) => b.count - a.count);
  return { total, byPlayground };
}
export async function deletePlaygroundRequest(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(playgroundRequests).where(eq(playgroundRequests.id, id));
}
// ─── Export helpers ───────────────────────────────────────────────────────────

export async function getWebinarRegistrantsExport() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      userId: webinarRegistrations.userId,
      webinarId: webinarRegistrations.webinarId,
      registeredAt: webinarRegistrations.registeredAt,
      userName: users.name,
      userEmail: users.email,
      webinarTitle: webinars.title,
    })
    .from(webinarRegistrations)
    .leftJoin(users, eq(users.id, webinarRegistrations.userId))
    .leftJoin(webinars, eq(webinars.id, webinarRegistrations.webinarId))
    .orderBy(desc(webinarRegistrations.registeredAt));
  return rows;
}

export async function getGuideDownloadersExport() {
  const db = await getDb();
  if (!db) return [];
  // guide_downloaded events joined with users and guides
  const rows = await db
    .select({
      userId: analyticsEvents.userId,
      resourceId: analyticsEvents.resourceId,
      createdAt: analyticsEvents.createdAt,
      userName: users.name,
      userEmail: users.email,
      guideTitle: guides.title,
      guideCategory: guides.category,
    })
    .from(analyticsEvents)
    .leftJoin(users, eq(users.id, analyticsEvents.userId))
    .leftJoin(guides, eq(guides.id, analyticsEvents.resourceId))
    .where(eq(analyticsEvents.eventType, "guide_downloaded"))
    .orderBy(desc(analyticsEvents.createdAt));
  return rows;
}

export async function getSupportSubmittersExport() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      ticketId: supportTickets.id,
      userId: supportTickets.userId,
      subject: supportTickets.subject,
      category: supportTickets.category,
      priority: supportTickets.priority,
      status: supportTickets.status,
      createdAt: supportTickets.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(supportTickets)
    .leftJoin(users, eq(users.id, supportTickets.userId))
    .orderBy(desc(supportTickets.createdAt));
  return rows;
}

// ─── Content Requests ─────────────────────────────────────────────────────────
export async function createContentRequest(data: {
  userId: number;
  requestType: "video" | "guide" | "webinar";
  topic: string;
  description?: string;
  category?: string;
  formatPreference?: string;
  priority: "low" | "medium" | "high";
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(contentRequests).values(data);
  return result;
}

export async function getContentRequests(requestType?: "video" | "guide" | "webinar") {
  const db = await getDb();
  if (!db) return [];
  const query = db
    .select({
      id: contentRequests.id,
      userId: contentRequests.userId,
      requestType: contentRequests.requestType,
      topic: contentRequests.topic,
      description: contentRequests.description,
      category: contentRequests.category,
      formatPreference: contentRequests.formatPreference,
      priority: contentRequests.priority,
      createdAt: contentRequests.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(contentRequests)
    .leftJoin(users, eq(users.id, contentRequests.userId))
    .orderBy(desc(contentRequests.createdAt));
  if (requestType) {
    return query.where(eq(contentRequests.requestType, requestType));
  }
  return query;
}

// ─── Page Readiness Checklist ─────────────────────────────────────────────────
export async function getReadinessItems(page: "academy" | "webinars" | "guides" | "playground" | "support") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pageReadinessItems).where(eq(pageReadinessItems.page, page)).orderBy(asc(pageReadinessItems.sortOrder));
}

export async function toggleReadinessItem(id: number, checked: boolean) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.update(pageReadinessItems).set({ checked }).where(eq(pageReadinessItems.id, id));
  return { success: true };
}

// ─── User Notifications ───────────────────────────────────────────────────────
export async function getNotificationsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  // Get all broadcast (userId null) + targeted (userId = this user) notifications
  const allNotifs = await db
    .select()
    .from(userNotifications)
    .orderBy(desc(userNotifications.createdAt));
  const relevant = allNotifs.filter((n) => n.userId === null || n.userId === userId);
  // Get read records for this user
  const reads = await db
    .select()
    .from(notificationReads)
    .where(eq(notificationReads.userId, userId));
  const readSet = new Set(reads.map((r) => r.notificationId));
  return relevant.map((n) => ({ ...n, read: readSet.has(n.id) }));
}

export async function markNotificationRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  // Upsert: only insert if not already read
  const existing = await db
    .select()
    .from(notificationReads)
    .where(and(eq(notificationReads.notificationId, notificationId), eq(notificationReads.userId, userId)));
  if (existing.length === 0) {
    await db.insert(notificationReads).values({ notificationId, userId });
  }
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  const notifs = await getNotificationsForUser(userId);
  for (const n of notifs) {
    if (!n.read) {
      await db.insert(notificationReads).values({ notificationId: n.id, userId });
    }
  }
}

export async function createNotification(data: {
  userId?: number | null;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "announcement";
  link?: string;
  linkLabel?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(userNotifications).values({
    userId: data.userId ?? null,
    title: data.title,
    message: data.message,
    type: data.type ?? "info",
    link: data.link ?? null,
    linkLabel: data.linkLabel ?? null,
  });
  return result;
}

export async function deleteNotification(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(notificationReads).where(eq(notificationReads.notificationId, id));
  await db.delete(userNotifications).where(eq(userNotifications.id, id));
}

export async function getAllNotifications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userNotifications).orderBy(desc(userNotifications.createdAt));
}

// ─── Academy: getCategories (DB-driven Academy page) ─────────────────────────
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  // Get all published courses ordered by category then sortOrder
  const allCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.published, true))
    .orderBy(courses.sortOrder, courses.createdAt);

  // For each course, get its published lessons
  const coursesWithLessons = await Promise.all(
    allCourses.map(async (course) => {
      const courseLessons = await db
        .select()
        .from(lessons)
        .where(and(eq(lessons.courseId, course.id), eq(lessons.published, true), eq(lessons.hidden, false)))
        .orderBy(lessons.sortOrder, lessons.createdAt);
      return { ...course, lessons: courseLessons };
    })
  );

  // Group by category
  const categoryOrder = ["Onboarding", "How-To", "Strategy and Best Practices"];
  const grouped: Record<string, typeof coursesWithLessons> = {};
  for (const course of coursesWithLessons) {
    if (!grouped[course.category]) grouped[course.category] = [];
    grouped[course.category].push(course);
  }

  return categoryOrder
    .filter((cat) => grouped[cat])
    .map((cat) => ({ category: cat, sections: grouped[cat] }));
}

// ─── Reorder helpers ──────────────────────────────────────────────────────────
export async function reorderCourses(id1: number, id2: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [c1] = await db.select({ sortOrder: courses.sortOrder }).from(courses).where(eq(courses.id, id1)).limit(1);
  const [c2] = await db.select({ sortOrder: courses.sortOrder }).from(courses).where(eq(courses.id, id2)).limit(1);
  if (!c1 || !c2) throw new Error("Course not found");
  await db.update(courses).set({ sortOrder: c2.sortOrder }).where(eq(courses.id, id1));
  await db.update(courses).set({ sortOrder: c1.sortOrder }).where(eq(courses.id, id2));
}

export async function reorderLessons(id1: number, id2: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [l1] = await db.select({ sortOrder: lessons.sortOrder }).from(lessons).where(eq(lessons.id, id1)).limit(1);
  const [l2] = await db.select({ sortOrder: lessons.sortOrder }).from(lessons).where(eq(lessons.id, id2)).limit(1);
  if (!l1 || !l2) throw new Error("Lesson not found");
  await db.update(lessons).set({ sortOrder: l2.sortOrder }).where(eq(lessons.id, id1));
  await db.update(lessons).set({ sortOrder: l1.sortOrder }).where(eq(lessons.id, id2));
}

export async function reorderWebinars(id1: number, id2: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [w1] = await db.select({ sortOrder: webinars.sortOrder }).from(webinars).where(eq(webinars.id, id1)).limit(1);
  const [w2] = await db.select({ sortOrder: webinars.sortOrder }).from(webinars).where(eq(webinars.id, id2)).limit(1);
  if (!w1 || !w2) throw new Error("Webinar not found");
  await db.update(webinars).set({ sortOrder: w2.sortOrder }).where(eq(webinars.id, id1));
  await db.update(webinars).set({ sortOrder: w1.sortOrder }).where(eq(webinars.id, id2));
}

export async function reorderGuides(id1: number, id2: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [g1] = await db.select({ sortOrder: guides.sortOrder }).from(guides).where(eq(guides.id, id1)).limit(1);
  const [g2] = await db.select({ sortOrder: guides.sortOrder }).from(guides).where(eq(guides.id, id2)).limit(1);
  if (!g1 || !g2) throw new Error("Guide not found");
  await db.update(guides).set({ sortOrder: g2.sortOrder }).where(eq(guides.id, id1));
  await db.update(guides).set({ sortOrder: g1.sortOrder }).where(eq(guides.id, id2));
}


/**
 * Returns up to `limit` courses that the user has started but not fully completed,
 * ordered by most recently updated progress. Used for the Dashboard "Continue Learning" section.
 */
export async function getRecentProgress(userId: number, limit = 3) {
  const db = await getDb();
  if (!db) return [];

  // Get all progress rows for this user
  const progressRows = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId))
    .orderBy(desc(lessonProgress.updatedAt));

  if (progressRows.length === 0) return [];

  // Collect unique courseIds in recency order
  const seenCourseIds: number[] = [];
  for (const row of progressRows) {
    if (!seenCourseIds.includes(row.courseId)) {
      seenCourseIds.push(row.courseId);
    }
  }

  // For each course, compute progress percentage
  const results: Array<{
    courseId: number;
    courseTitle: string;
    category: string;
    completedLessons: number;
    totalLessons: number;
    progressPct: number;
    lastUpdatedAt: Date;
  }> = [];

  for (const courseId of seenCourseIds) {
    if (results.length >= limit) break;

    const [course] = await db
      .select({ id: courses.id, title: courses.title, category: courses.category })
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.published, true)))
      .limit(1);

    if (!course) continue;

    const totalLessonsRows = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(and(eq(lessons.courseId, courseId), eq(lessons.published, true)));

    const totalLessons = totalLessonsRows.length;
    if (totalLessons === 0) continue;

    const completedRows = progressRows.filter(
      (p) => p.courseId === courseId && p.completed
    );
    const completedLessons = completedRows.length;
    const progressPct = Math.round((completedLessons / totalLessons) * 100);

    // Skip fully completed courses (100%)
    if (progressPct >= 100) continue;

    const lastUpdatedAt = progressRows
      .filter((p) => p.courseId === courseId)
      .reduce((latest, p) => (p.updatedAt > latest ? p.updatedAt : latest), new Date(0));

    results.push({
      courseId: course.id,
      courseTitle: course.title,
      category: course.category,
      completedLessons,
      totalLessons,
      progressPct,
      lastUpdatedAt,
    });
  }

  return results;
}

/** Get the N most recently created published lessons (for dashboard "Recently Added") */
export async function getRecentLessons(limit = 4) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      description: lessons.description,
      courseId: lessons.courseId,
      tags: lessons.tags,
      durationMinutes: lessons.durationMinutes,
      createdAt: lessons.createdAt,
    })
    .from(lessons)
    .where(and(eq(lessons.published, true), eq(lessons.hidden, false)))
    .orderBy(desc(lessons.createdAt))
    .limit(limit);
  // Enrich with course info
  const enriched = await Promise.all(
    rows.map(async (l) => {
      const [course] = await db
        .select({ title: courses.title, category: courses.category })
        .from(courses)
        .where(eq(courses.id, l.courseId))
        .limit(1);
      return { ...l, courseTitle: course?.title ?? "", category: course?.category ?? "" };
    })
  );
  return enriched;
}

// ─── Site Settings ────────────────────────────────────────────────────────────
export async function getSiteSetting(key: string): Promise<Record<string, boolean> | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  if (!rows[0]) return null;
  try { return JSON.parse(rows[0].value) as Record<string, boolean>; } catch { return null; }
}

export async function upsertSiteSetting(key: string, value: Record<string, boolean>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const json = JSON.stringify(value);
  await db.insert(siteSettings).values({ key, value: json })
    .onDuplicateKeyUpdate({ set: { value: json } });
}

// ─── Content Request Management ───────────────────────────────────────────────
export async function deleteContentRequest(id: number) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.delete(contentRequests).where(eq(contentRequests.id, id));
  return { success: true };
}

// ─── User Strike / Flag ───────────────────────────────────────────────────────
export async function addStrikeToUser(userId: number) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.update(users).set({ strikes: sql`strikes + 1` }).where(eq(users.id, userId));
  const [updated] = await db.select({ strikes: users.strikes }).from(users).where(eq(users.id, userId)).limit(1);
  return { success: true, strikes: updated?.strikes ?? 0 };
}
export async function removeStrikeFromUser(userId: number) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.update(users).set({ strikes: sql`GREATEST(strikes - 1, 0)` }).where(eq(users.id, userId));
  const [updated] = await db.select({ strikes: users.strikes }).from(users).where(eq(users.id, userId)).limit(1);
  return { success: true, strikes: updated?.strikes ?? 0 };
}

// ─── Manual User Creation (Admin) ─────────────────────────────────────────────
export async function createManualUser(data: {
  name: string;
  email: string;
  role: "user" | "admin" | "super_admin";
}) {
  const db = await getDb();
  if (!db) return null;
  // Check if email already exists
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);
  if (existing.length > 0) throw new Error("A user with this email already exists.");
  // Generate a unique openId for manually-created users
  const openId = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const [result] = await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    role: data.role,
    loginMethod: "manual",
    isActive: true,
  });
  return result;
}

// ─── Invite Tokens ─────────────────────────────────────────────────────────────
export async function generateInvite(data: {
  email: string;
  name?: string;
  role: "user" | "admin" | "super_admin";
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // Generate a secure random token (hex string)
  const { randomBytes } = await import("crypto");
  const token = randomBytes(32).toString("hex");
  // Expire in 72 hours
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
  await db.insert(inviteTokens).values({
    email: data.email,
    name: data.name,
    token,
    role: data.role,
    used: false,
    expiresAt,
    createdBy: data.createdBy,
  });
  return { token, expiresAt };
}

export async function getInviteByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(inviteTokens)
    .where(eq(inviteTokens.token, token))
    .limit(1);
  return result[0] ?? null;
}

export async function claimInvite(data: {
  token: string;
  name: string;
  passwordHash: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const invite = await getInviteByToken(data.token);
  if (!invite) throw new Error("Invalid invite token.");
  if (invite.used) throw new Error("This invite has already been used.");
  if (new Date() > invite.expiresAt) throw new Error("This invite link has expired.");

  // Check if user with this email already exists
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, invite.email))
    .limit(1);

  let userId: number;
  if (existing.length > 0) {
    // Update existing user (manual stub created by admin)
    userId = existing[0].id;
    await db
      .update(users)
      .set({
        name: data.name,
        passwordHash: data.passwordHash,
        isActive: true,
        loginMethod: "password",
      })
      .where(eq(users.id, userId));
  } else {
    // Create fresh user
    const openId = `invite_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const [result] = await db.insert(users).values({
      openId,
      name: data.name,
      email: invite.email,
      role: invite.role,
      passwordHash: data.passwordHash,
      loginMethod: "password",
      isActive: true,
    });
    userId = (result as any).insertId;
  }

  // Mark token as used
  await db
    .update(inviteTokens)
    .set({ used: true })
    .where(eq(inviteTokens.token, data.token));

  // Return the user for session creation
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user;
}

export async function getUserPlaygroundRequest(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(playgroundRequests)
    .where(eq(playgroundRequests.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

// ─── Section Resources ────────────────────────────────────────────────────────
import { sectionResources } from "../drizzle/schema";

export async function getSectionResourcesByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(sectionResources)
    .where(eq(sectionResources.courseId, courseId))
    .orderBy(asc(sectionResources.sortOrder), asc(sectionResources.createdAt));
}

export async function getSectionResourcesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  // Join with courses to filter by category
  const rows = await db
    .select({
      id: sectionResources.id,
      courseId: sectionResources.courseId,
      label: sectionResources.label,
      fileUrl: sectionResources.fileUrl,
      fileName: sectionResources.fileName,
      sortOrder: sectionResources.sortOrder,
      isHidden: sectionResources.isHidden,
      createdAt: sectionResources.createdAt,
      courseTitle: courses.title,
    })
    .from(sectionResources)
    .innerJoin(courses, eq(sectionResources.courseId, courses.id))
    .where(sql`${courses.category} = ${category} AND ${sectionResources.isHidden} = 0`)
    .orderBy(asc(sectionResources.sortOrder), asc(sectionResources.createdAt));
  return rows;
}

export async function createSectionResource(data: {
  courseId: number;
  label: string;
  fileUrl: string;
  fileName: string;
  sortOrder?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(sectionResources).values({
    courseId: data.courseId,
    label: data.label,
    fileUrl: data.fileUrl,
    fileName: data.fileName,
    sortOrder: data.sortOrder ?? 0,
  });
  const id = (result as any).insertId as number;
  const [row] = await db.select().from(sectionResources).where(eq(sectionResources.id, id)).limit(1);
  return row;
}

export async function updateSectionResource(id: number, data: { label?: string; courseId?: number; sortOrder?: number; isHidden?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(sectionResources).set(data).where(eq(sectionResources.id, id));
  const [row] = await db.select().from(sectionResources).where(eq(sectionResources.id, id)).limit(1);
  return row;
}

export async function deleteSectionResource(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(sectionResources).where(eq(sectionResources.id, id));
}

export async function reorderSectionResources(id1: number, id2: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const rows = await db
    .select({ id: sectionResources.id, sortOrder: sectionResources.sortOrder })
    .from(sectionResources)
    .where(sql`${sectionResources.id} IN (${id1}, ${id2})`);
  if (rows.length < 2) return;
  const [a, b] = rows;
  await db.update(sectionResources).set({ sortOrder: b.sortOrder }).where(eq(sectionResources.id, a.id));
  await db.update(sectionResources).set({ sortOrder: a.sortOrder }).where(eq(sectionResources.id, b.id));
}

export async function getAllSectionResources() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: sectionResources.id,
      courseId: sectionResources.courseId,
      label: sectionResources.label,
      fileUrl: sectionResources.fileUrl,
      fileName: sectionResources.fileName,
      sortOrder: sectionResources.sortOrder,
      isHidden: sectionResources.isHidden,
      createdAt: sectionResources.createdAt,
      courseTitle: courses.title,
      courseCategory: courses.category,
    })
    .from(sectionResources)
    .innerJoin(courses, eq(sectionResources.courseId, courses.id))
    .orderBy(asc(courses.category), asc(sectionResources.courseId), asc(sectionResources.sortOrder));
  return rows;
}

// ─── Magic Link Token Helpers ─────────────────────────────────────────────────
import crypto from "crypto";

export async function createMagicToken(
  email: string,
  type: "login" | "invite",
  userId?: number
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await db.insert(magicLinkTokens).values({
    email: email.toLowerCase(),
    token,
    type,
    userId: userId ?? null,
    expiresAt,
  });
  return token;
}

export async function validateMagicToken(token: string): Promise<{
  email: string;
  type: "login" | "invite";
  userId: number | null;
} | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(magicLinkTokens)
    .where(eq(magicLinkTokens.token, token))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.usedAt) return null; // already used
  if (new Date() > row.expiresAt) return null; // expired
  // Mark as used
  await db
    .update(magicLinkTokens)
    .set({ usedAt: new Date() })
    .where(eq(magicLinkTokens.id, row.id));
  return { email: row.email, type: row.type, userId: row.userId ?? null };
}
