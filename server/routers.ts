import { TRPCError } from "@trpc/server";
import { and, desc, eq, like, ne, sql } from "drizzle-orm";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getReadinessItems, toggleReadinessItem } from "./db";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { hashPassword, verifyPassword, createSessionToken } from "./nativeAuth";
import { getUserByEmail, createNativeUser, upsertGoogleUser, generateInvite, getInviteByToken, claimInvite, createMagicToken, validateMagicToken, setMfaSetupToken, activateMfa, resetMfa, getUserByMfaSetupToken } from "./db";
import {
  createCourse,
  createGuide,
  createLesson,
  createSupportTicket,
  createWebinar,
  deleteCourse,
  deleteGuide,
  deleteLesson,
  deleteWebinar,
  getActiveUsers,
  getAllTickets,
  getAllUsers,
  getAnalyticsSummary,
  getCourseById,
  getCourses,
  getDailyEventCounts,
  getEventCountsByType,
  getGuideById,
  getGuides,
  getLessonsByCourse,
  getLessonsByCategory,
  getLessonById,
  getRecentEvents,
  getSignInTrend,
  getTopContent,
  getUserProgress,
  getUserTrophies,
  searchContent,
  getUserTickets,
  getUserWebinarRegistrations,
  getWebinarById,
  getArchivedExclusiveWebinars,
  getWebinars,
  incrementGuideDownload,
  incrementWebinarView,
  markLessonComplete,
  touchLessonProgress,
  registerForWebinar,
  trackEvent,
  updateCourse,
  updateGuide,
  updateLesson,
  updateTicketStatus,
  updateUserRole,
  updateWebinar,
  getUserActivity,
  updateUserAvatar,
  getUserById,
  removeTagFromAllLessons,
  getAllUsedTags,
  getUserBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked,
  createPlaygroundRequest,
  getPlaygroundRequests,
  getUserPlaygroundRequest,
  getPlaygroundStats,
  deletePlaygroundRequest,
  getWebinarRegistrantsExport,
  getGuideDownloadersExport,
  getSupportSubmittersExport,
  createContentRequest,
  getContentRequests,
  deleteUser,
  updateUserStatus,
  getUserStats,
  clearAllAnalytics,
  getStatDetail,
  getCategories,
  reorderCourses,
  reorderLessons,
  reorderWebinars,
  reorderGuides,
  getAllSectionResources,
  getSectionResourcesByCategory,
  createSectionResource,
  updateSectionResource,
  deleteSectionResource,
  reorderSectionResources,
  getRecentProgress,
  getRecentLessons,
  getNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
  deleteNotification,
  getAllNotifications,
  deleteContentRequest,
  addStrikeToUser,
  removeStrikeFromUser,
  createManualUser,
  getPartnerContent,
  createPartnerContent,
  updatePartnerContent,
  deletePartnerContent,
  getPartnerUsers,
  trackAnonEvent,
  getAnonPageViews,
  getTopAnonPages,
  getAllPageViews,
  getTopAllPages,
  getAcademyPlaysByCategory,
  getAcademyPlaysBySection,
  getTopAcademyLessons,
  getWebinarPlaysByType,
  getTopWebinars,
  getGuideDownloadsByType,
  getTopGuides,
  getAskWavvConversations,
  getAnonDailyTrend,
  resetWebinarViews,
  resetGuideDownloads,
  getContentLeaderboard,
  updateLastSignedIn,
  getHelpCollections,
  getAllHelpCollections,
  getHelpArticles,
  getAllHelpArticles,
  getHelpArticleById,
  setHelpArticleVisible,
  setHelpCollectionVisible,
  getPublishedHelpArticles,
  publishHelpArticle,
  unpublishHelpArticle,
  updatePublishedArticleSection,
  reorderPublishedArticles,
  getHelpArticleSections,
  createHelpArticleSection,
  deleteHelpArticleSection,
  renameHelpArticleSection,
  reorderHelpArticleSections,
  toggleHelpArticleSectionVisibility,
  getVisibleHelpArticleSections,
  createNativeHelpArticle,
  updateNativeHelpArticle,
  unpublishHelpArticleById,
  getPdfSections,
  createPdfSection,
  renamePdfSection,
  togglePdfSectionVisibility,
  deletePdfSection,
  reorderPdfSections,
  getFaqSections,
  createFaqSection,
  renameFaqSection,
  toggleFaqSectionVisibility,
  deleteFaqSection,
  reorderFaqSections,
  getFaqEntriesBySection,
  createFaqEntry,
  updateFaqEntry,
  toggleFaqEntryVisibility,
  deleteFaqEntry,
  reorderFaqEntries,
  getEnhancedAnalyticsSummary,
  getContentPerformance,
  getDropOffFunnel,
  getTopSearchTerms,
  getZeroResultSearches,
} from "./db";
import { runIntercomSync } from "./intercomSync";

// ─── Role guards ─────────────────────────────────────────────────────────────
// Canonical roles: owner | content_admin (Publisher) | partner_admin (Partner Manager) | admin (Viewer)

// Owner only — full platform control (must be approved employee)
const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.accountType !== "employee" || ctx.user.approvalStatus !== "approved") {
    throw new TRPCError({ code: "FORBIDDEN", message: "WAVV employees only" });
  }
  if (ctx.user.role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Owner access required" });
  }
  return next({ ctx });
});
// Publisher (content_admin) or Owner — manage all content in Academy, Webinars, Guides; view analytics
const publisherProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.accountType !== "employee" || ctx.user.approvalStatus !== "approved") {
    throw new TRPCError({ code: "FORBIDDEN", message: "WAVV employees only" });
  }
  if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Publisher access required" });
  }
  return next({ ctx });
});
// Alias for backward compatibility within this file
const superAdminProcedure = publisherProcedure;
// Any WAVV employee with approved status — Command Center access
const commandCenterProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.accountType !== "employee") {
    throw new TRPCError({ code: "FORBIDDEN", message: "WAVV employees only" });
  }
  if (ctx.user.approvalStatus !== "approved") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Command Center access pending approval" });
  }
  return next({ ctx });
});
// Alias for backward compatibility within this file
const adminProcedure = commandCenterProcedure;
// Partner Manager (partner_admin), Publisher (content_admin), or Owner — can manage team invites
const partnerManagerOrPublisherProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "publisher" && ctx.user.role !== "partner_manager" && ctx.user.role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Partner Manager or Publisher access required" });
  }
  return next({ ctx });
});
// Alias for backward compatibility within this file
const partnerAdminOrSuperProcedure = partnerManagerOrPublisherProcedure;
// ─── Academy Router ───────────────────────────────────────────────────────────
const academyRouter = router({
  getCourses: publicProcedure.query(async () => {
    const allCourses = await getCourses(true);
    const enriched = await Promise.all(
      allCourses.map(async (c) => {
        const courseLessons = await getLessonsByCourse(c.id, true);
        return { ...c, lessonCount: courseLessons.length };
      })
    );
    return enriched;
  }),

  getCourse: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const course = await getCourseById(input.id);
      if (!course || !course.published) throw new TRPCError({ code: "NOT_FOUND" });
      const courseLessons = await getLessonsByCourse(input.id, true);
      return { course, lessons: courseLessons };
    }),

  getProgress: protectedProcedure
    .input(z.object({ courseId: z.number().optional() }))
    .query(({ ctx, input }) => getUserProgress(ctx.user.id, input.courseId)),

  getRecentProgress: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(({ ctx, input }) => getRecentProgress(ctx.user.id, input.limit ?? 3)),
  getRecentLessons: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(({ input }) => getRecentLessons(input.limit ?? 4)),

  trackOpen: protectedProcedure
    .input(z.object({ lessonId: z.number(), courseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await touchLessonProgress(ctx.user.id, input.lessonId, input.courseId);
      return { success: true };
    }),
  markComplete: protectedProcedure
    .input(z.object({ lessonId: z.number(), courseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await markLessonComplete(ctx.user.id, input.lessonId, input.courseId);
      await trackEvent({
        userId: ctx.user.id,
        eventType: "lesson_completed",
        resourceType: "lesson",
        resourceId: input.lessonId,
        metadata: JSON.stringify({ courseId: input.courseId }),
      });
      return { success: true };
    }),

  // Admin CRUD
  adminCreateCourse: superAdminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.enum([
          "Onboarding",
          "How-To",
          "Strategy and Best Practices",
          "Dialer Setup",
          "CRM Integrations",
          "Spam Protection",
        ]),
        thumbnailUrl: z.string().optional(),
        durationMinutes: z.number().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(({ input }) => createCourse(input)),

  adminUpdateCourse: superAdminProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          category: z
            .enum([
              "Onboarding",
              "How-To",
              "Strategy and Best Practices",
              "Dialer Setup",
              "CRM Integrations",
              "Spam Protection",
            ])
            .optional(),
          thumbnailUrl: z.string().optional(),
          durationMinutes: z.number().optional(),
          sortOrder: z.number().optional(),
          published: z.boolean().optional(),
          tags: z.string().nullable().optional(),
        }),
      })
    )
    .mutation(({ input }) => updateCourse(input.id, input.data)),

  adminDeleteCourse: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteCourse(input.id)),

  adminGetAllCourses: superAdminProcedure.query(() => getCourses(false)),

  adminCreateLesson: superAdminProcedure
    .input(
      z.object({
        courseId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        durationMinutes: z.number().optional(),
        durationSeconds: z.number().optional(),
        sortOrder: z.number().optional(),
        pipEnabled: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => createLesson(input)),

  adminUpdateLesson: superAdminProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          videoUrl: z.string().optional(),
          durationMinutes: z.number().optional(),
          durationSeconds: z.number().optional(),
          sortOrder: z.number().optional(),
          published: z.boolean().optional(),
          inactiveReason: z.string().nullable().optional(),
          tags: z.string().nullable().optional(),
          fileUrl: z.string().nullable().optional(),
          starred: z.boolean().optional(),
          hidden: z.boolean().optional(),
          pipEnabled: z.boolean().optional(),
        }),
      })
    )
    .mutation(({ input }) => updateLesson(input.id, input.data)),

  adminDeleteLesson: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteLesson(input.id)),
  adminUploadLessonFile: superAdminProcedure
    .input(z.object({ base64: z.string(), mimeType: z.string(), fileName: z.string() }))
    .mutation(async ({ input }) => {
      const { storagePut } = await import("./storage");
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.fileName.split(".").pop() ?? "pdf";
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 80);
      const key = `lesson-files/${Date.now()}-${safeName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url, fileName: input.fileName };
    }),

  adminRemoveTagFromAll: superAdminProcedure
    .input(z.object({ tag: z.string().min(1) }))
    .mutation(({ input }) => removeTagFromAllLessons(input.tag)),

  adminGetAllUsedTags: superAdminProcedure
    .query(() => getAllUsedTags()),

  adminGetLessons: superAdminProcedure
    .input(z.object({ courseId: z.number() }))
    .query(({ input }) => getLessonsByCourse(input.courseId, false)),

  getLessonsByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => getLessonsByCategory(input.category)),

  // Returns courses (sections) for a given category — includes tags field for user-facing display
  getCoursesByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const allCourses = await getCourses(true);
      return allCourses.filter((c) => c.category === input.category);
    }),

  // Returns ALL lessons across all courses for the content management view
  adminGetAllLessons: superAdminProcedure
    .query(async () => {
      const allCourses = await getCourses(false);
      const results = await Promise.all(
        allCourses.map(async (course) => {
          const courseLessons = await getLessonsByCourse(course.id, false);
          return courseLessons.map((l) => ({ ...l, courseId: course.id, courseTitle: course.title, courseCategory: course.category }));
        })
      );
      return results.flat();
    }),

  // DB-driven Academy page: courses grouped by category with their published lessons
  getCategories: publicProcedure.query(() => getCategories()),

  // Reorder: swap sortOrder between two courses (content_admin only)
  reorderCourses: superAdminProcedure
    .input(z.object({ id1: z.number(), id2: z.number() }))
    .mutation(({ input }) => reorderCourses(input.id1, input.id2)),

  // Reorder: swap sortOrder between two lessons (content_admin only)
  reorderLessons: superAdminProcedure
    .input(z.object({ id1: z.number(), id2: z.number() }))
    .mutation(({ input }) => reorderLessons(input.id1, input.id2)),

  // ─── Section Resources (standalone PDFs per section) ─────────────────────
  // List all section resources (admin view — includes courseTitle + courseCategory)
  adminGetSectionResources: adminProcedure
    .query(() => getAllSectionResources()),

  // List section resources for a specific category (user-facing)
  getSectionResourcesByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => getSectionResourcesByCategory(input.category)),

  // Upload a PDF and create a section resource record
  adminUploadSectionResource: superAdminProcedure
    .input(z.object({
      courseId: z.number(),
      label: z.string().min(1),
      base64: z.string(),
      mimeType: z.string(),
      fileName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { storagePut } = await import("./storage");
      const buffer = Buffer.from(input.base64, "base64");
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 80);
      const key = `section-resources/${Date.now()}-${safeName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      const resource = await createSectionResource({
        courseId: input.courseId,
        label: input.label,
        fileUrl: url,
        fileName: input.fileName,
        sortOrder: 0,
      });
      return resource;
    }),

  // Update label or move to a different section
  adminUpdateSectionResource: superAdminProcedure
    .input(z.object({
      id: z.number(),
      label: z.string().min(1).optional(),
      courseId: z.number().optional(),
    }))
    .mutation(({ input }) => updateSectionResource(input.id, {
      label: input.label,
      courseId: input.courseId,
    })),

  // Reorder two section resources by swapping sortOrder
  adminReorderSectionResources: superAdminProcedure
    .input(z.object({ id1: z.number(), id2: z.number() }))
    .mutation(({ input }) => reorderSectionResources(input.id1, input.id2)),

  // Toggle visibility of a section resource
  adminToggleSectionResourceVisibility: superAdminProcedure
    .input(z.object({ id: z.number(), isHidden: z.boolean() }))
    .mutation(({ input }) => updateSectionResource(input.id, { isHidden: input.isHidden })),

  // Delete a section resource
  adminDeleteSectionResource: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteSectionResource(input.id)),
  // Fetch Loom video duration via public oEmbed API (no API key needed)
  fetchLoomDuration: superAdminProcedure
    .input(z.object({ videoUrl: z.string() }))
    .mutation(async ({ input }) => {
      const { videoUrl } = input;
      const loomMatch = videoUrl.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
      if (!loomMatch) return { durationSeconds: null as number | null, error: "Not a Loom URL" };
      try {
        const shareUrl = `https://www.loom.com/share/${loomMatch[1]}`;
        const res = await fetch(`https://www.loom.com/v1/oembed?url=${encodeURIComponent(shareUrl)}`);
        if (!res.ok) return { durationSeconds: null as number | null, error: `oEmbed fetch failed: ${res.status}` };
        const data = await res.json() as { duration?: number };
        return { durationSeconds: (data.duration ?? null) as number | null, error: null };
      } catch (e) {
        return { durationSeconds: null as number | null, error: String(e) };
      }
    }),
});

// ─── Webinars Router ──────────────────────────────────────────────────────────
const webinarsRouter = router({
  list: publicProcedure
    .input(z.object({ type: z.enum(["upcoming", "recording", "exclusive", "evergreen"]).optional() }))
    .query(({ input }) => getWebinars(input.type)),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const webinar = await getWebinarById(input.id);
      if (!webinar) throw new TRPCError({ code: "NOT_FOUND" });
      return webinar;
    }),

  /** Public: track when a visitor clicks a Register/Join button (no auth needed) */
  trackRegistrationClick: publicProcedure
    .input(z.object({ webinarId: z.number() }))
    .mutation(async ({ input }) => {
      await trackEvent({
        eventType: "webinar_registration_click",
        resourceType: "webinar",
        resourceId: input.webinarId,
      });
      return { success: true };
    }),

  register: protectedProcedure
    .input(z.object({ webinarId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await registerForWebinar(ctx.user.id, input.webinarId);
      if (!result.alreadyRegistered) {
        await trackEvent({
          userId: ctx.user.id,
          eventType: "webinar_registered",
          resourceType: "webinar",
          resourceId: input.webinarId,
        });
      }
      return result;
    }),

  watch: publicProcedure
    .input(z.object({ webinarId: z.number() }))
    .mutation(async ({ input }) => {
      await incrementWebinarView(input.webinarId);
      // Only on-demand (recording) webinars are tracked here; evergreen/exclusive use registration_click
      await trackEvent({
        eventType: "webinar_ondemand_watched",
        resourceType: "webinar",
        resourceId: input.webinarId,
      });
      return { success: true };
    }),

  getMyRegistrations: protectedProcedure.query(({ ctx }) =>
    getUserWebinarRegistrations(ctx.user.id)
  ),

  // Admin CRUD
  adminCreate: superAdminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        host: z.string().optional(),
        type: z.enum(["upcoming", "recording", "exclusive", "evergreen"]),
        scheduledAt: z.date().optional(),
        registrationUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        accentColor: z.string().optional(),
        iconName: z.string().optional(),
        pipEnabled: z.boolean().optional(),
        comingSoon: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => createWebinar({ ...input, published: true })),

  adminUpdate: superAdminProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          host: z.string().optional(),
          type: z.enum(["upcoming", "recording", "exclusive", "evergreen"]).optional(),
          scheduledAt: z.date().optional(),
          registrationUrl: z.string().optional(),
          videoUrl: z.string().optional(),
          thumbnailUrl: z.string().optional(),
          accentColor: z.string().optional(),
          iconName: z.string().optional(),
          published: z.boolean().optional(),
          pipEnabled: z.boolean().optional(),
          comingSoon: z.boolean().optional(),
        }),
      })
    )
    .mutation(({ input }) => updateWebinar(input.id, input.data)),

  // Reset view count to 0 for a specific webinar
  adminResetViews: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => resetWebinarViews(input.id)),

  adminDelete: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteWebinar(input.id)),

  adminList: superAdminProcedure.query(() => getWebinars()),
  adminExportRegistrants: superAdminProcedure.query(() => getWebinarRegistrantsExport()),
  // Archived exclusive webinars (past scheduledAt)
  archivedExclusive: superAdminProcedure.query(() => getArchivedExclusiveWebinars()),
  // Publish an archived exclusive webinar to on-demand (type -> recording, published -> true)
  publishToOnDemand: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => updateWebinar(input.id, { type: "recording", published: true })),
  // Keep archived (unpublish so it's invisible to users)
  keepArchived: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => updateWebinar(input.id, { published: false })),
  // Reorder: swap sortOrder between two webinars (content_admin only)
  adminReorder: superAdminProcedure
    .input(z.object({ id1: z.number(), id2: z.number() }))
    .mutation(({ input }) => reorderWebinars(input.id1, input.id2)),
  // Upload a branded thumbnail image to S3
  uploadThumbnail: superAdminProcedure
    .input(z.object({
      base64: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { storagePut } = await import("./storage");
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
      const key = `webinars/thumbnails/${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url };
    }),
  // Upload a video file to S3 for on-demand/evergreen webinars
  uploadVideo: superAdminProcedure
    .input(z.object({
      base64: z.string(),
      mimeType: z.enum(["video/mp4", "video/webm", "video/ogg", "video/quicktime"]),
      fileName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { storagePut } = await import("./storage");
      const buffer = Buffer.from(input.base64, "base64");
      const key = `webinars/videos/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url };
    }),
});

// ─── Guides Router ────────────────────────────────────────────────────────────
const guidesRouter = router({
  list: publicProcedure.query(() => getGuides(true)),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const guide = await getGuideById(input.id);
      if (!guide) throw new TRPCError({ code: "NOT_FOUND" });
      return guide;
    }),

  download: publicProcedure
    .input(z.object({ guideId: z.number() }))
    .mutation(async ({ input }) => {
      await incrementGuideDownload(input.guideId);
      await trackEvent({
        eventType: "guide_downloaded",
        resourceType: "guide",
        resourceId: input.guideId,
      });
      return { success: true };
    }),

  // Admin CRUD
  // Upload a guide file to S3 and return a masked portal URL
  uploadFile: superAdminProcedure
    .input(z.object({
      base64: z.string(),
      mimeType: z.enum(["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]),
      fileName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { storagePut } = await import("./storage");
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.fileName.split(".").pop() ?? "pdf";
      const key = `guides/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url };
    }),
  adminCreate: superAdminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        fileUrl: z.string().optional(),
        linkLabel: z.string().max(255).optional(),
        // fileType maps to the category section: pdf | checklist | playbook | other | help_article
        fileType: z.enum(["pdf", "checklist", "playbook", "other", "help_article"]).optional(),
      })
    )
    .mutation(({ input }) => createGuide({ ...input, published: true })),

  adminUpdate: superAdminProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          category: z.string().optional(),
          fileUrl: z.string().optional(),
          linkLabel: z.string().max(255).optional().nullable(),
          fileType: z.enum(["pdf", "checklist", "playbook", "other", "help_article"]).optional(),
          published: z.boolean().optional(),
        }),
      })
    )
    .mutation(({ input }) => updateGuide(input.id, input.data)),

  adminDelete: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteGuide(input.id)),

  adminList: superAdminProcedure.query(() => getGuides(false)),
  adminExportDownloaders: superAdminProcedure.query(() => getGuideDownloadersExport()),
  // Returns distinct section (category) names used by PDF guides — for autocomplete in Add Guide form
  listSections: publicProcedure.query(async () => {
    const all = await getGuides(false);
    // Include all PDF guides (published or not) that have a category — this ensures sections
    // created via createSection (unpublished placeholder guides) appear in the dropdown.
    const sections = Array.from(new Set(
      all.filter(g => g.fileType === 'pdf' && g.category).map(g => g.category as string)
    )).sort();
    return sections;
  }),

  // Reorder: swap sortOrder between two guides (content_admin only)
  adminReorder: superAdminProcedure
    .input(z.object({ id1: z.number(), id2: z.number() }))
    .mutation(({ input }) => reorderGuides(input.id1, input.id2)),

  // Reset download count to 0 for a specific guide
  adminResetDownloads: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => resetGuideDownloads(input.id)),
  // Create a named PDF section (stored in pdf_sections table)
  createSection: superAdminProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ input }) => createPdfSection(input.name)),
  // List all PDF sections (admin)
  listPdfSections: superAdminProcedure
    .query(() => getPdfSections()),
  // List PDF sections (public — for portal)
  listPdfSectionsPublic: publicProcedure
    .query(() => getPdfSections()),
  // Rename a PDF section
  renamePdfSection: superAdminProcedure
    .input(z.object({ id: z.number(), name: z.string().min(1) }))
    .mutation(({ input }) => renamePdfSection(input.id, input.name)),
  // Toggle visibility of a PDF section
  togglePdfSectionVisibility: superAdminProcedure
    .input(z.object({ id: z.number(), isVisible: z.boolean() }))
    .mutation(({ input }) => togglePdfSectionVisibility(input.id, input.isVisible)),
  // Delete a PDF section
  deletePdfSection: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deletePdfSection(input.id)),
  // Reorder PDF sections
  reorderPdfSections: superAdminProcedure
    .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
    .mutation(({ input }) => reorderPdfSections(input)),
});

// ─── Support Router ───────────────────────────────────────────────────────────
const supportRouter = router({
  submitTicket: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1).max(255),
        category: z.enum([
          "Technical Issue",
          "Billing",
          "Feature Request",
          "Onboarding",
          "General Question",
          "Other",
        ]),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        description: z.string().min(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createSupportTicket({ ...input, userId: ctx.user.id, status: "open" });
      await trackEvent({
        userId: ctx.user.id,
        eventType: "ticket_submitted",
        resourceType: "ticket",
        metadata: JSON.stringify({ category: input.category, priority: input.priority }),
      });
      // Notify WAVV team (Cassie & Jake)
      await notifyOwner({
        title: `New Support Ticket: ${input.subject}`,
        content: `**Customer:** ${ctx.user.name ?? ctx.user.email ?? "Unknown"}\n**Category:** ${input.category}\n**Priority:** ${input.priority}\n\n**Description:**\n${input.description}`,
      });
      // Intercom integration — create conversation when API key is configured
      if (ENV.intercomApiKey) {
        try {
          const intercomBody: Record<string, unknown> = {
            from: { type: "user", email: ctx.user.email ?? undefined },
            body: `[${input.category}] [${input.priority.toUpperCase()}] ${input.subject}\n\n${input.description}`,
          };
          await fetch("https://api.intercom.io/conversations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${ENV.intercomApiKey}`,
              Accept: "application/json",
            },
            body: JSON.stringify(intercomBody),
          });
        } catch (err) {
          // Non-fatal: log but don't block ticket submission
          console.error("[Intercom] Failed to create conversation:", err);
        }
      }
      return { success: true };
    }),

  getMyTickets: protectedProcedure.query(({ ctx }) => getUserTickets(ctx.user.id)),

  // Admin
  adminGetAll: superAdminProcedure.query(() => getAllTickets()),
  adminExportSubmitters: superAdminProcedure.query(() => getSupportSubmittersExport()),
  adminUpdateStatus: superAdminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]),
      })
    )
    .mutation(({ input }) => updateTicketStatus(input.id, input.status)),
});

// ─── WAVV AI Router ───────────────────────────────────────────────────────────
const wavvAiRouter = router({
  chat: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const systemPrompt = `You are WAVV AI, the intelligent assistant for WAVV's Customer Resource Center. WAVV is a multi-line power dialer and sales engagement platform built for high-volume outbound calling teams.

Your role is to:
1. Answer product questions about WAVV features (dialer, call boards, voicemails, spam protection, CRM integrations, call campaigns, number health, connection rates, etc.)
2. Guide users through WAVV setup and configuration step-by-step
3. Help users troubleshoot common issues before they escalate to a support ticket
4. Direct users to the appropriate resource: WAVV Academy courses, webinars, guides, or the support team
5. Deflect common support tickets by providing self-service answers

Key WAVV features you know about:
- Multi-line power dialer (single line and multi-line modes)
- Call Boards for team calling sessions
- Voicemail drop and management
- Spam protection and number health monitoring
- WAVV Wallet for number management
- CRM integrations (GoHighLevel, Salesforce, HubSpot, etc.)
- Call campaigns and resuming campaigns
- Connection rates vs conversion rates
- Audio source configuration
- User roles and permissions
- Team onboarding and agent setup

When you cannot answer something with confidence, say so clearly and suggest the user submit a support ticket or book a call with the WAVV team.

Be concise, direct, and helpful. Use bullet points for step-by-step instructions. Do not make up features or capabilities that WAVV may not have.`;

      const llmMessages = [
        { role: "system" as const, content: systemPrompt },
        ...input.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ];

      const response = await invokeLLM({ messages: llmMessages });
      const content = response.choices[0]?.message?.content ?? "I'm sorry, I couldn't process that request.";

      await trackEvent({
        userId: ctx.user.id,
        eventType: "ai_chat",
        resourceType: "ai",
        metadata: JSON.stringify({ messageCount: input.messages.length }),
      });

      return { content };
    }),
});

// ─── Analytics Router ─────────────────────────────────────────────────
const analyticsRouter = router({
  getSummary: adminProcedure.query(() => getAnalyticsSummary()),
  getUsers: superAdminProcedure.query(() => getAllUsers()),
  updateUserRole: superAdminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "viewer"]) }))
    .mutation(({ input }) => updateUserRole(input.userId, input.role)),

  // ── Advanced analytics for admin dashboard ──
  getEventCounts: adminProcedure
    .input(z.object({ days: z.number().min(1).max(365).default(30) }))
    .query(({ input }) => {
      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getEventCountsByType(since);
    }),
  getStatDetail: adminProcedure
    .input(z.object({
      eventTypes: z.array(z.string()).min(1),
      days: z.number().min(1).max(365).default(30),
      limit: z.number().min(1).max(500).default(200),
    }))
    .query(({ input }) => {
      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getStatDetail(input.eventTypes, since, input.limit);
    }),

  getSignInTrend: adminProcedure
    .input(z.object({ days: z.number().min(1).max(365).default(30) }))
    .query(({ input }) => {
      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getSignInTrend(since);
    }),

  getDailyEvents: adminProcedure
    .input(z.object({ eventType: z.string(), days: z.number().min(1).max(365).default(30) }))
    .query(({ input }) => {
      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getDailyEventCounts(input.eventType, since);
    }),

  getActiveUsers: adminProcedure
    .input(z.object({ days: z.number().min(1).max(365).default(30) }))
    .query(({ input }) => {
      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getActiveUsers(since);
    }),

  getTopContent: adminProcedure
    .input(z.object({ days: z.number().min(1).max(365).default(30), limit: z.number().min(1).max(50).default(10) }))
    .query(({ input }) => {
      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getTopContent(since, input.limit);
    }),

  getRecentEvents: adminProcedure
    .input(z.object({ days: z.number().min(1).max(365).default(7), limit: z.number().min(1).max(100).default(50) }))
    .query(({ input }) => {
      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getRecentEvents(since, input.limit);
    }),

  getContentLeaderboard: adminProcedure
    .input(z.object({ days: z.number().min(1).max(365).default(30), limit: z.number().min(1).max(50).default(25) }))
    .query(({ input }) => {
      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getContentLeaderboard(since, input.limit);
    }),

  exportCSV: superAdminProcedure
    .input(z.object({ days: z.number().min(1).max(365).default(30) }))
    .query(async ({ input }) => {
      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      const [eventCounts, signInTrend, activeUsersData, topContentData, summary, rawEvents, allUsersData] = await Promise.all([
        getEventCountsByType(since),
        getSignInTrend(since),
        getActiveUsers(since),
        getTopContent(since, 50),
        getAnalyticsSummary(),
        getRecentEvents(since, 10000),
        getAllUsers(),
      ]);

      // Build user ID → email lookup
      const userMap = new Map<number, string>();
      (allUsersData ?? []).forEach((u: { id: number; email: string | null }) => {
        if (u.email) userMap.set(u.id, u.email);
      });

      const rows: string[] = [];

      // ── Section 1: Summary ──
      rows.push("=== SUMMARY ===");
      rows.push("Section,Metric,Value,Period");
      rows.push(`Summary,Total Users,${summary?.totalUsers ?? 0},all time`);
      rows.push(`Summary,Active Users,${activeUsersData.count},last ${input.days}d`);
      eventCounts.forEach((e) => {
        const label = e.eventType.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        rows.push(`Events,${label},${e.count},last ${input.days}d`);
      });

      // ── Section 2: Sign-in trend ──
      rows.push("");
      rows.push("=== SIGN-IN TREND ===");
      rows.push("Date,Sign-Ins");
      signInTrend.forEach((d) => rows.push(`${d.date},${d.count}`));

      // ── Section 3: Top content ──
      rows.push("");
      rows.push("=== TOP CONTENT ===");
      rows.push("Rank,Resource Type,Resource ID,Event Type,Count");
      topContentData.forEach((item, idx) => {
        const evtLabel = item.eventType.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        rows.push(`${idx + 1},${item.resourceType ?? "unknown"},${item.resourceId ?? "-"},${evtLabel},${item.count}`);
      });

      // ── Section 4: Raw event log ──
      rows.push("");
      rows.push("=== RAW EVENT LOG ===");
      rows.push("Timestamp,Event Type,User Email,Resource Type,Resource ID,Metadata");
      rawEvents.forEach((evt) => {
        const ts = evt.createdAt ? new Date(evt.createdAt).toISOString() : "";
        const evtType = evt.eventType ?? "";
        const userEmail = evt.userId ? (userMap.get(evt.userId) ?? `user_${evt.userId}`) : "anonymous";
        const resType = evt.resourceType ?? "";
        const resId = evt.resourceId != null ? String(evt.resourceId) : "";
        // Escape metadata for CSV (wrap in quotes if it contains commas)
        const meta = evt.metadata ? `"${String(evt.metadata).replace(/"/g, '""')}"` : "";
         rows.push(`${ts},${evtType},${userEmail},${resType},${resId},${meta}`);
      });
      return rows.join("\n");
    }),
  resetAnalytics: superAdminProcedure
    .mutation(async () => {
      await clearAllAnalytics();
      return { success: true };
    }),

  // ── Anonymous-only analytics (revamped dashboard) ──
  /** Track an anonymous event — authenticated users are silently dropped server-side */
  trackAnon: publicProcedure
    .input(z.object({
      eventType: z.string().max(100),
      resourceType: z.string().max(50).optional(),
      resourceId: z.number().int().optional(),
      metadata: z.string().max(2000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Drop if any authenticated user
      if (ctx.user) return { ok: false };
      await trackAnonEvent({
        eventType: input.eventType,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        metadata: input.metadata,
        userId: null,
      });
      return { ok: true };
    }),

  getAnonOverview: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30) }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      const [totalPageViews, topPages, academyByCategory, academyBySection, topLessons, webinarByType, topWebinars, guidesByType, topGuides, askWavvCount] = await Promise.all([
        getAllPageViews(since),           // all users (anon + auth)
        getTopAllPages(since, 10),        // per-page breakdown, all users
        getAcademyPlaysByCategory(since),
        getAcademyPlaysBySection(since, 20),
        getTopAcademyLessons(since, 20),
        getWebinarPlaysByType(since),
        getTopWebinars(since, 20),
        getGuideDownloadsByType(since),
        getTopGuides(since, 20),
        getAskWavvConversations(since),
      ]);
      return { totalPageViews, topPages, academyByCategory, academyBySection, topLessons, webinarByType, topWebinars, guidesByType, topGuides, askWavvCount };
    }),

  getPageViewDrilldown: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30) }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      const [total, pages] = await Promise.all([
        getAllPageViews(since),
        getTopAllPages(since, 50),
      ]);
      return { total, pages };
    }),

  getAnonTrend: adminProcedure
    .input(z.object({
      eventType: z.string(),
      days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30),
    }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getAnonDailyTrend(input.eventType, since);
    }),

  // ── Enhanced analytics for Insights tab ──
  getEnhancedSummary: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30) }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getEnhancedAnalyticsSummary(since);
    }),
  getContentPerformance: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30) }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getContentPerformance(since);
    }),
  getDropOffFunnel: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30) }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getDropOffFunnel(since);
    }),
  getTopSearchTerms: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30) }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getTopSearchTerms(since);
    }),
  getZeroResultSearches: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30) }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getZeroResultSearches(since);
    }),

  // ── Enhanced analytics for Insights tab ──
  getEnhancedSummary: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30) }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getEnhancedAnalyticsSummary(since);
    }),
  getContentPerformance: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30) }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getContentPerformance(since);
    }),
  getDropOffFunnel: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30) }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getDropOffFunnel(since);
    }),
  getTopSearchTerms: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30) }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getTopSearchTerms(since);
    }),
  getZeroResultSearches: adminProcedure
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(180), z.literal(365), z.literal(0)]).default(30) }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getZeroResultSearches(since);
    }),
});

// ─── Scheduled Task endpoint ──────────────────────────────────────────────────
const scheduledRouter = router({
  ping: publicProcedure.query(() => ({ ok: true })),
});

// ─// ─── App Router ───────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => {
      const u = opts.ctx.user;
      if (!u) return null;
      // Explicit allow-list — NEVER spread the full DB row.
      // Sensitive fields (mfaSecret, mfaSetupToken, mfaSetupTokenExpiresAt,
      // passwordHash, passwordResetToken, passwordResetExpires, openId, googleId)
      // must never reach the client.
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatarUrl: u.avatarUrl,
        isActive: u.isActive,
        loginMethod: u.loginMethod,
        mfaEnabled: u.mfaEnabled,
        createdAt: u.createdAt,
        lastSignedIn: u.lastSignedIn,
        mfaPending: opts.ctx.mfaPending,
        mfaForceReenroll: u.mfaForceReenroll ?? false,
        // WAVV IdP identity fields
        accountType: u.accountType,
        approvalStatus: u.approvalStatus,
        isEmployee: u.isEmployee,
        isCustomer: u.isCustomer,
      };
    }),



    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

  }),
  academy: academyRouter,
  webinars: webinarsRouter,
  guides: guidesRouter,
  support: supportRouter,
  wavvAi: wavvAiRouter,
  analytics: analyticsRouter,
  scheduled: scheduledRouter,
  admin: router({
    listUsers: adminProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const allUsersData = await getAllUsers();
        // All internal roles see all internal accounts
        const filtered = allUsersData;
        const search = input?.search?.trim().toLowerCase();
        if (!search) return filtered;
        return allUsersData.filter(
          (u) =>
            (u.name ?? "").toLowerCase().includes(search) ||
            (u.email ?? "").toLowerCase().includes(search)
        );
      }),
    updateRole: ownerProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "viewer", "publisher", "partner_manager", "partner", "owner"]) }))
      .mutation(async ({ ctx, input }) => {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot change your own role" });
        }
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    removeUser: ownerProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot remove yourself" });
        }
        const allUsers = await getAllUsers();
        const target = allUsers.find(u => u.id === input.userId);
        if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        await deleteUser(input.userId);
        return { success: true };
      }),
    toggleUserStatus: ownerProcedure
      .input(z.object({ userId: z.number(), isActive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot change your own status" });
        }
        await updateUserStatus(input.userId, input.isActive);
        return { success: true };
      }),
    getUserStats: ownerProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const stats = await getUserStats(input.userId);
        if (!stats) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        return stats;
      }),
    addUser: partnerAdminOrSuperProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
        role: z.enum(["viewer", "publisher", "partner_manager", "partner", "owner"]).default("viewer"),
      }))
      .mutation(async ({ input }) => {
        // Create the user record — they authenticate via WAVV IdP, no invite link needed
        const result = await createManualUser({ name: input.name, email: input.email, role: input.role });
        if (!result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
        return { success: true };
      }),

    // Notification management (admin only)
    listNotifications: superAdminProcedure.query(async () => {
      return getAllNotifications();
    }),
    createNotification: superAdminProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        message: z.string().min(1),
        type: z.enum(["info", "success", "warning", "announcement"]).default("info"),
        userId: z.number().optional(),
        link: z.string().optional(),
        linkLabel: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createNotification({
          userId: input.userId ?? null,
          title: input.title,
          message: input.message,
          type: input.type,
          link: input.link,
          linkLabel: input.linkLabel,
        });
        return { success: true };
      }),
    deleteNotification: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteNotification(input.id);
        return { success: true };
      }),

    // ── Users Management ─────────────────────────────────────────────────────
    /** List all WAVV employees (account_type = 'employee'), with lesson/bookmark counts */
    listEmployees: commandCenterProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(users)
        .where(and(eq(users.accountType, "employee"), like(users.email, "%@wavv.com")))
        .orderBy(desc(users.createdAt));
      return rows.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        accountType: u.accountType,
        approvalStatus: u.approvalStatus,
        isEmployee: u.isEmployee,
        lastSignedIn: u.lastSignedIn,
        createdAt: u.createdAt,
        avatarUrl: u.avatarUrl,
        isActive: u.isActive,
      }));
    }),

    /** List all portal users (customers + guests), with metadata from IdP */
    listPortalUsers: commandCenterProcedure
      .input(z.object({
        accountType: z.enum(["customer", "guest", "all"]).default("all"),
        subscriptionStatus: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { users: [], total: 0 };
        // Exclude employees AND anyone with a @wavv.com email (they belong in WAVV Team)
        const conditions = [
          ne(users.accountType, "employee"),
          sql`(${users.email} IS NULL OR ${users.email} NOT LIKE '%@wavv.com')`,
        ];
        if (input.accountType !== "all") {
          conditions.push(eq(users.accountType, input.accountType));
        }
        if (input.subscriptionStatus) {
          conditions.push(eq(users.subscriptionStatus, input.subscriptionStatus));
        }
        if (input.search) {
          const s = `%${input.search}%`;
          conditions.push(
            sql`(${users.name} LIKE ${s} OR ${users.email} LIKE ${s})`
          );
        }
        const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
        const [rows, countRows] = await Promise.all([
          db.select().from(users).where(whereClause).orderBy(desc(users.lastSignedIn)).limit(input.limit).offset(input.offset),
          db.select({ count: sql<number>`COUNT(*)` }).from(users).where(whereClause),
        ]);
        const total = countRows[0]?.count ?? 0;
        return {
          total,
          users: rows.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            accountType: u.accountType,
            isCustomer: u.isCustomer,
            wavvAccountId: u.wavvAccountId,
            subscriptionStatus: u.subscriptionStatus,
            wavvPlan: u.wavvPlan,
            createdAt: u.createdAt,
            lastSignedIn: u.lastSignedIn,
            avatarUrl: u.avatarUrl,
            isActive: u.isActive,
          })),
        };
      }),

    /** Approve or deny a WAVV employee's Command Center access */
    updateApproval: ownerProcedure
      .input(z.object({
        userId: z.number(),
        approvalStatus: z.enum(["approved", "denied", "pending"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot change your own approval status" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(users).set({ approvalStatus: input.approvalStatus }).where(eq(users.id, input.userId));
        return { success: true };
      }),
  }),
  // Notifications for the current user
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getNotificationsForUser(ctx.user.id);
    }),
    markRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.notificationId, ctx.user.id);
        return { success: true };
      }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),
  search: router({
    query: publicProcedure
      .input(z.object({ q: z.string().min(1).max(200) }))
      .query(async ({ ctx, input }) => {
        if (input.q.trim().length < 2) return { courses: [], lessons: [], webinars: [], guides: [], helpArticles: [] };
        // Only track search events for logged-in users
        if (ctx.user) {
          await trackEvent({ userId: ctx.user.id, eventType: "search", metadata: JSON.stringify({ query: input.q.trim() }) });
        }
        return searchContent(input.q.trim());
      }),
  }),
  trophy: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserTrophies(ctx.user.id);
    }),
  }),
  tracking: router({
    pageView: publicProcedure
      .input(z.object({ path: z.string().max(500) }))
      .mutation(async ({ ctx, input }) => {
        // Skip internal team members entirely — they should never appear in analytics
        const INTERNAL_ROLES = ['owner', 'admin', 'content_admin', 'partner_admin'];
        if (ctx.user && INTERNAL_ROLES.includes(ctx.user.role)) {
          return { ok: true };
        }
        // Only track the 7 customer-facing pages
        const TRACKED_PAGES = ['/', '/academy', '/webinars', '/guides', '/playground', '/support', '/wavvpartner'];
        if (!TRACKED_PAGES.includes(input.path)) {
          return { ok: true };
        }
        await trackEvent({
          userId: ctx.user?.id,
          eventType: "page_view",
          metadata: JSON.stringify({ path: input.path }),
        });
        return { ok: true };
      }),
  }),
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
        role: user.role,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
      };
    }),
    getActivity: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(30) }))
      .query(async ({ ctx, input }) => {
        return getUserActivity(ctx.user.id, input.limit);
      }),
    updateAvatar: protectedProcedure
      .input(z.object({ avatarUrl: z.string().url().nullable() }))
      .mutation(async ({ ctx, input }) => {
        await updateUserAvatar(ctx.user.id, input.avatarUrl);
        return { success: true };
      }),
    uploadAvatar: protectedProcedure
      .input(z.object({ base64: z.string(), mimeType: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.base64, "base64");
        const ext = input.mimeType.split("/")[1] ?? "jpg";
        const key = `avatars/user-${ctx.user.id}-${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await updateUserAvatar(ctx.user.id, url);
        return { url };
      }),
  }),
  playground: router({
    getRequests: superAdminProcedure.query(async () => {
      return getPlaygroundRequests();
    }),
    getStats: superAdminProcedure.query(async () => {
      return getPlaygroundStats();
    }),
    hasRequested: protectedProcedure.query(async ({ ctx }) => {
      const existing = await getUserPlaygroundRequest(ctx.user.id);
      return { hasRequested: existing !== null };
    }),
    submitRequest: protectedProcedure
      .input(z.object({
        optIn: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        // Enforce one-request-per-user
        const existing = await getUserPlaygroundRequest(ctx.user.id);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "You have already requested access to WAVV Playground." });
        }
        const userName = ctx.user.name ?? "";
        const userEmail = ctx.user.email ?? "";
        await createPlaygroundRequest({
          userId: ctx.user.id,
          name: userName,
          email: userEmail,
          playground: "WAVV Playground",
          optIn: input.optIn,
          message: null,
        });
        await notifyOwner({
          title: `New Playground Opt-In: ${userName}`,
          content: `User: ${userName} (${userEmail})\nOpt-in to notifications: ${input.optIn ? "Yes" : "No"}`,
        });
        return { success: true };
      }),
    deleteRequest: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePlaygroundRequest(input.id);
        return { success: true };
      }),
    submitPublicInterest: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
      }))
      .mutation(async ({ input }) => {
        await createPlaygroundRequest({
          userId: undefined,
          name: input.name,
          email: input.email,
          playground: "WAVV Playground",
          optIn: true,
          message: null,
        });
        await notifyOwner({
          title: `New Playground Interest: ${input.name}`,
          content: `Name: ${input.name}\nEmail: ${input.email}\nSource: Public Home Page`,
        });
        return { success: true };
      }),
  }),
  bookmarks: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return getUserBookmarks(ctx.user.id);
    }),
    add: protectedProcedure
      .input(z.object({
        contentType: z.enum(["lesson", "webinar", "guide"]),
        contentId: z.number(),
        contentTitle: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return addBookmark(ctx.user.id, input.contentType, input.contentId, input.contentTitle);
      }),
    remove: protectedProcedure
      .input(z.object({
        contentType: z.enum(["lesson", "webinar", "guide"]),
        contentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await removeBookmark(ctx.user.id, input.contentType, input.contentId);
        return { success: true };
      }),
    check: protectedProcedure
      .input(z.object({
        contentType: z.enum(["lesson", "webinar", "guide"]),
        contentId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        return isBookmarked(ctx.user.id, input.contentType, input.contentId);
      }),
  }),

  // ─── Content Requests ──────────────────────────────────────────────────────
  contentRequests: router({
    submit: protectedProcedure
      .input(z.object({
        requestType: z.enum(["video", "guide", "webinar"]),
        topic: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.string().optional(),
        formatPreference: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
      }))
      .mutation(async ({ ctx, input }) => {
        await createContentRequest({ userId: ctx.user.id, ...input });
        const typeLabel = input.requestType === "video" ? "Video" : input.requestType === "guide" ? "Guide" : "Webinar";
        await notifyOwner({
          title: `New ${typeLabel} Request: ${input.topic}`,
          content: [
            `User: ${ctx.user.name ?? ctx.user.email ?? "Unknown"} (${ctx.user.email ?? ""})`,
            `Type: ${typeLabel}`,
            `Topic: ${input.topic}`,
            input.category ? `Category: ${input.category}` : null,
            input.formatPreference ? `Format Preference: ${input.formatPreference}` : null,
            `Priority: ${input.priority}`,
            input.description ? `\nDetails: ${input.description}` : null,
          ].filter(Boolean).join("\n"),
        });
        return { success: true };
      }),

    // Public endpoint — logs a search query that returned no results
    submitSearchQuery: publicProcedure
      .input(z.object({
        query: z.string().min(1).max(255),
      }))
      .mutation(async ({ ctx, input }) => {
        // Use userId if logged in, otherwise use a sentinel value (0 = anonymous)
        const userId = ctx.user?.id ?? 0;
        await createContentRequest({
          userId,
          requestType: "search_query",
          topic: input.query,
          description: "Auto-generated from search bar: no results found",
          priority: "low",
        });
        return { success: true };
      }),

    adminList: superAdminProcedure
      .input(z.object({ requestType: z.enum(["video", "guide", "webinar", "search_query"]).optional() }))
      .query(async ({ input }) => {
        return getContentRequests(input.requestType);
      }),

    adminExportCsv: superAdminProcedure
      .query(async () => {
        const rows = await getContentRequests();
        const header = "Date,Type,Topic,User,Email,Description";
        const lines = rows.map((r) => {
          const date = r.createdAt ? new Date(r.createdAt).toISOString() : "";
          const desc = r.description ? `"${String(r.description).replace(/"/g, '""')}"` : "";
          return `${date},${r.requestType},"${r.topic}",${r.userName ?? ""},${r.userEmail ?? ""},${desc}`;
        });
        return [header, ...lines].join("\n");
      }),
    adminDelete: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteContentRequest(input.id);
      }),
    adminFlagUser: superAdminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        return addStrikeToUser(input.userId);
      }),
    adminUnflagUser: superAdminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        return removeStrikeFromUser(input.userId);
      }),
  }),

  siteSettings: router({
    getAll: publicProcedure.query(async () => {
      const { getSiteSettings } = await import("./db");
      return getSiteSettings();
    }),
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const { getSiteSetting } = await import("./db");
        return getSiteSetting(input.key);
      }),
    update: protectedProcedure
      .input(z.object({ key: z.string(), value: z.union([z.boolean(), z.string(), z.number(), z.record(z.string(), z.boolean())]) }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN", message: "Owner access required" });
        return next({ ctx });
      })
      .mutation(async ({ input }) => {
        const { upsertSiteSetting } = await import("./db");
        await upsertSiteSetting(input.key, input.value);
        return { success: true };
      }),
  }),
  // ─── Partner Content ─────────────────────────────────────────────────────────
  partnerContent: router({
    list: publicProcedure
      .input(z.object({ pageTarget: z.enum(["public", "portal"]).optional() }))
      .query(({ input }) => getPartnerContent(input.pageTarget)),

    create: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "owner" && ctx.user.role !== "partner_manager") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .input(z.object({
        pageTarget: z.enum(["public", "portal"]),
        blockType: z.enum(["hero", "module", "resource_card", "quick_link"]),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        linkUrl: z.string().optional(),
        status: z.enum(["coming_soon", "live"]).optional(),
        isLocked: z.boolean().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(({ input }) => createPartnerContent(input)),

    update: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "owner" && ctx.user.role !== "partner_manager") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        linkUrl: z.string().optional(),
        status: z.enum(["coming_soon", "live"]).optional(),
        isLocked: z.boolean().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updatePartnerContent(id, data);
      }),

    delete: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "owner" && ctx.user.role !== "partner_manager") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deletePartnerContent(input.id)),
  }),

  // ─── Approved Partners ────────────────────────────────────────────────────────
  approvedPartners: router({
    list: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "owner" && ctx.user.role !== "partner_manager") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(() => getPartnerUsers()),

    invite: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "owner" && ctx.user.role !== "partner_manager") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .input(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
        origin: z.string().url().optional(),
      }))
.mutation(async ({ input }) => {
        // Create or update user as partner — they authenticate via WAVV IdP
        const email = input.email.trim().toLowerCase();
        let user = await getUserByEmail(email);
        if (!user) {
          user = await createNativeUser({ email, name: input.name.trim(), passwordHash: null, role: "partner" });
        } else {
          await updateUserRole(user.id, "partner");
        }
        return { success: true };
      }),

    deactivate: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "owner" && ctx.user.role !== "partner_manager") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        const { updateUserStatus } = await import("./db");
        await updateUserStatus(input.userId, false);
        return { success: true };
      }),

    remove: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "owner" && ctx.user.role !== "partner_manager") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteUser(input.userId);
        return { success: true };
      }),

    resendInvite: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "owner" && ctx.user.role !== "partner_manager") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .input(z.object({ userId: z.number(), origin: z.string().url().optional() }))
      .mutation(async ({ input, ctx }) => {
        const allUsers = await getAllUsers();
        const target = allUsers.find(u => u.id === input.userId);
        if (!target || !target.email) throw new TRPCError({ code: "NOT_FOUND" });
        const { token } = await generateInvite({
          email: target.email,
          name: target.name ?? target.email,
          role: "partner",
          createdBy: ctx.user.id,
        });
        const appUrl = input.origin ?? process.env.VITE_APP_URL ?? "https://wavvsuccesscenter.manus.space";
        const inviteLink = `${appUrl}/accept-invite?token=${token}`;
        return { success: true, inviteLink };
      }),
  }),

  helpArticles: router({
    // Public: list collections with their visible articles
    listCollections: publicProcedure.query(() => getHelpCollections()),

    // Public: list visible articles (optionally by collection)
    list: publicProcedure
      .input(z.object({ collectionId: z.string().optional() }))
      .query(({ input }) => getHelpArticles(input.collectionId)),

    // Public: get single article by id
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const article = await getHelpArticleById(input.id);
        if (!article || !article.visible) throw new TRPCError({ code: "NOT_FOUND" });
        return article;
      }),

    // Admin: list all articles (including hidden)
    adminListAll: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(() => getAllHelpArticles()),

    // Admin: list all collections (including hidden)
    adminListCollections: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(() => getAllHelpCollections()),

    // Admin: toggle article visibility
    setArticleVisible: protectedProcedure
      .input(z.object({ id: z.number(), visible: z.boolean() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => setHelpArticleVisible(input.id, input.visible)),

    // Admin: toggle collection visibility
    setCollectionVisible: protectedProcedure
      .input(z.object({ id: z.number(), visible: z.boolean() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => setHelpCollectionVisible(input.id, input.visible)),

    // Admin: trigger manual sync from Intercom
    sync: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(async () => {
        const result = await runIntercomSync();
        return result;
      }),

    // ── Published Help Articles (customer-facing) ──────────────────────────
    // Public: list published articles (for customer-facing Guides & Docs)
    listPublished: publicProcedure.query(() => getPublishedHelpArticles()),

    // Admin: publish an article (or update its section/order)
    publish: protectedProcedure
      .input(z.object({
        intercomArticleId: z.string(),
        title: z.string(),
        url: z.string().optional().nullable(),
        sectionName: z.string().min(1),
        sortOrder: z.number().optional(),
        sectionOrder: z.number().optional(),
      }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => publishHelpArticle(input)),

    // Admin: unpublish (remove from customer-facing section)
    unpublish: protectedProcedure
      .input(z.object({ intercomArticleId: z.string() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => unpublishHelpArticle(input.intercomArticleId)),

    // Admin: update section assignment for a published article
    updateSection: protectedProcedure
      .input(z.object({ intercomArticleId: z.string(), sectionName: z.string().min(1) }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => updatePublishedArticleSection(input.intercomArticleId, input.sectionName)),

    // Admin: bulk reorder published articles (update sortOrder + sectionOrder)
    reorder: protectedProcedure
      .input(z.array(z.object({
        intercomArticleId: z.string(),
        sortOrder: z.number(),
        sectionOrder: z.number(),
      })))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => reorderPublishedArticles(input)),

    // ── Help Article Sections (named groups for customer-facing display) ──────
    // Public: list visible sections only
    listSections: publicProcedure.query(() => getVisibleHelpArticleSections()),

    // Admin: list all sections (including hidden)
    listSectionsAdmin: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(() => getHelpArticleSections()),

    // Admin: toggle section visibility
    toggleSectionVisibility: protectedProcedure
      .input(z.object({ id: z.number(), isVisible: z.boolean() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => toggleHelpArticleSectionVisibility(input.id, input.isVisible)),

    // Admin: create a new section
    createSection: protectedProcedure
      .input(z.object({ name: z.string().min(1) }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => createHelpArticleSection(input.name)),

    // Admin: delete a section
    deleteSection: protectedProcedure
      .input(z.object({ id: z.number() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => deleteHelpArticleSection(input.id)),

    // Admin: rename a section
    renameSection: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1) }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => renameHelpArticleSection(input.id, input.name)),

    // Admin: reorder sections
    reorderSections: protectedProcedure
      .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => reorderHelpArticleSections(input)),
    // Admin: create a native (portal-authored) article
    createNativeArticle: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        nativeBody: z.string().min(1),
        sectionName: z.string().min(1),
        nativeAuthorName: z.string().optional().nullable(),
      }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input, ctx }) => createNativeHelpArticle({
        ...input,
        nativeAuthorName: input.nativeAuthorName ?? ctx.user.name ?? null,
      })),
    // Admin: update a native article
    updateNativeArticle: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        nativeBody: z.string().min(1).optional(),
        sectionName: z.string().min(1).optional(),
        nativeAuthorName: z.string().optional().nullable(),
      }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => updateNativeHelpArticle(input.id, input)),
    // Admin: unpublish by numeric id (works for both intercom and native articles)
    unpublishById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => unpublishHelpArticleById(input.id)),
  }),

  faq: router({
    // Public: list visible sections with their visible entries
    listSectionsPublic: publicProcedure.query(async () => {
      const sections = await getFaqSections(true);
      const withEntries = await Promise.all(
        sections.map(async (s) => ({
          ...s,
          entries: await getFaqEntriesBySection(s.id, true),
        }))
      );
      return withEntries;
    }),
    // Admin: list all sections (including hidden)
    listSectionsAdmin: publisherProcedure.query(async () => {
      const sections = await getFaqSections(false);
      const withEntries = await Promise.all(
        sections.map(async (s) => ({
          ...s,
          entries: await getFaqEntriesBySection(s.id, false),
        }))
      );
      return withEntries;
    }),
    createSection: publisherProcedure
      .input(z.object({ name: z.string().min(1).max(255) }))
      .mutation(({ input }) => createFaqSection(input.name)),
    renameSection: publisherProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1).max(255) }))
      .mutation(({ input }) => renameFaqSection(input.id, input.name)),
    toggleSectionVisibility: publisherProcedure
      .input(z.object({ id: z.number(), isVisible: z.boolean() }))
      .mutation(({ input }) => toggleFaqSectionVisibility(input.id, input.isVisible)),
    deleteSection: publisherProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteFaqSection(input.id)),
    reorderSections: publisherProcedure
      .input(z.object({ items: z.array(z.object({ id: z.number(), sortOrder: z.number() })) }))
      .mutation(({ input }) => reorderFaqSections(input.items)),
    // Entry CRUD
    createEntry: publisherProcedure
      .input(z.object({ sectionId: z.number(), question: z.string().min(1).max(500), answer: z.string().min(1), fileUrl: z.string().optional(), fileName: z.string().optional() }))
      .mutation(({ input }) => createFaqEntry(input)),
    updateEntry: publisherProcedure
      .input(z.object({ id: z.number(), question: z.string().min(1).max(500).optional(), answer: z.string().min(1).optional(), fileUrl: z.string().nullable().optional(), fileName: z.string().nullable().optional() }))
      .mutation(({ input }) => updateFaqEntry(input.id, { question: input.question, answer: input.answer, fileUrl: input.fileUrl, fileName: input.fileName })),
    uploadEntryFile: publisherProcedure
      .input(z.object({ fileName: z.string(), fileBase64: z.string(), mimeType: z.string().default("application/pdf") }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.fileBase64, "base64");
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 80);
        const key = `faq-files/${Date.now()}-${safeName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url, fileName: input.fileName };
      }),
    toggleEntryVisibility: publisherProcedure
      .input(z.object({ id: z.number(), isVisible: z.boolean() }))
      .mutation(({ input }) => toggleFaqEntryVisibility(input.id, input.isVisible)),
    deleteEntry: publisherProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteFaqEntry(input.id)),
    reorderEntries: publisherProcedure
      .input(z.object({ items: z.array(z.object({ id: z.number(), sortOrder: z.number() })) }))
      .mutation(({ input }) => reorderFaqEntries(input.items)),
  }),

  readiness: router({
    getItems: protectedProcedure
      .input(z.object({ page: z.enum(["academy", "webinars", "guides", "playground", "support"]) }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(({ input }) => getReadinessItems(input.page)),

    toggleItem: protectedProcedure
      .input(z.object({ id: z.number(), checked: z.boolean() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => toggleReadinessItem(input.id, input.checked)),
  }),
});

export type AppRouter = typeof appRouter;
