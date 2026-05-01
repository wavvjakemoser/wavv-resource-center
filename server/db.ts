import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analyticsEvents,
  courses,
  guides,
  InsertUser,
  lessonProgress,
  lessons,
  supportTickets,
  users,
  webinarRegistrations,
  webinars,
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

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
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
    ? and(eq(lessons.courseId, courseId), eq(lessons.published, true))
    : eq(lessons.courseId, courseId);
  return db.select().from(lessons).where(conditions).orderBy(lessons.sortOrder, lessons.createdAt);
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
export async function getWebinars(type?: "upcoming" | "recording") {
  const db = await getDb();
  if (!db) return [];
  const conditions = type
    ? and(eq(webinars.type, type), eq(webinars.published, true))
    : eq(webinars.published, true);
  return db.select().from(webinars).where(conditions).orderBy(desc(webinars.scheduledAt));
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
