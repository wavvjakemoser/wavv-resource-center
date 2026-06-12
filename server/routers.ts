import { TRPCError } from "@trpc/server";
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
} from "./db";
import { runIntercomSync } from "./intercomSync";

// ─── Login rate-limit store (in-memory, per email+IP, 5 attempts / 15 min) ────
const loginAttemptStore = new Map<string, { count: number; windowStart: number }>();
// Prune expired entries every 30 minutes to prevent unbounded memory growth
setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  Array.from(loginAttemptStore.entries()).forEach(([key, entry]) => {
    if (entry.windowStart < cutoff) loginAttemptStore.delete(key);
  });
}, 30 * 60 * 1000);

// ─── Role guards ─────────────────────────────────────────────────────────────
// Canonical roles: owner | content_admin (Publisher) | partner_admin (Partner Manager) | admin (Viewer)

// Owner only — full platform control
const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Owner access required" });
  }
  return next({ ctx });
});
// Publisher (content_admin) or Owner — manage all content in Academy, Webinars, Guides; view analytics
const publisherProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "publisher" && ctx.user.role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Publisher access required" });
  }
  return next({ ctx });
});
// Alias for backward compatibility within this file
const superAdminProcedure = publisherProcedure;
// Any Command Center role (Viewer/admin, Publisher/content_admin, Partner Manager/partner_admin, Owner) — read-only access
const commandCenterProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "partner_manager" && ctx.user.role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Command Center access required" });
  }  return next({ ctx });
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
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(0)]).default(30) }))
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
    .input(z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(0)]).default(30) }))
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
      days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(0)]).default(30),
    }))
    .query(async ({ input }) => {
      const since = input.days === 0 ? new Date(0) : new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      return getAnonDailyTrend(input.eventType, since);
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
        strikes: u.strikes,
        mfaPending: opts.ctx.mfaPending,
      };
    }),

    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        // ── Rate limiting: 5 failed attempts per email per 15 minutes ──────────
        const emailKey = input.email.trim().toLowerCase();
        const ipKey = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || ctx.req.socket.remoteAddress || "unknown";
        const rateLimitKey = `${emailKey}::${ipKey}`;
        const now = Date.now();
        const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
        const MAX_ATTEMPTS = 5;
        const entry = loginAttemptStore.get(rateLimitKey);
        if (entry) {
          // Clear window if it has expired
          if (now - entry.windowStart > WINDOW_MS) {
            loginAttemptStore.delete(rateLimitKey);
          } else if (entry.count >= MAX_ATTEMPTS) {
            const retryAfterSec = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: `TOO_MANY_ATTEMPTS::${retryAfterSec}`,
            });
          }
        }
        // ── Authenticate ────────────────────────────────────────────────────────
        const user = await getUserByEmail(input.email);
        if (!user || !user.isActive) {
          // Record failed attempt
          const cur = loginAttemptStore.get(rateLimitKey);
          loginAttemptStore.set(rateLimitKey, cur && now - cur.windowStart <= WINDOW_MS
            ? { count: cur.count + 1, windowStart: cur.windowStart }
            : { count: 1, windowStart: now });
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        // User exists but has never set a password — guide them to the invite/reset flow
        if (!user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "No password set for this account. Please use your invite link or ask your admin to resend it." });
        }
        const valid = await verifyPassword(input.password, user.passwordHash);
        if (!valid) {
          // Record failed attempt
          const cur = loginAttemptStore.get(rateLimitKey);
          loginAttemptStore.set(rateLimitKey, cur && now - cur.windowStart <= WINDOW_MS
            ? { count: cur.count + 1, windowStart: cur.windowStart }
            : { count: 1, windowStart: now });
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        // Successful password check — clear the attempt counter
        loginAttemptStore.delete(rateLimitKey);
        // If MFA is enabled, return a challenge instead of issuing a session
        if (user.mfaEnabled && user.mfaSecret) {
          // Issue a short-lived MFA challenge token (10 min) so the client can complete step 2
          const cryptoMod = await import("crypto");
          const challengeToken = cryptoMod.randomBytes(32).toString("hex");
          // Reuse mfa_setup_token field as a challenge token (expires in 10 min)
          await setMfaSetupToken(user.id, user.mfaSecret, challengeToken, Date.now() + 10 * 60 * 1000);
          return { success: true, mfaRequired: true, challengeToken, user: null };
        }
        // Issue session — only admin/owner roles require MFA setup
        const MFA_REQUIRED_ROLES = ["owner", "viewer", "publisher", "partner_manager"];
        const requiresMfa = MFA_REQUIRED_ROLES.includes(user.role);
        const mfaPending = requiresMfa && !user.mfaEnabled;
        const token = await createSessionToken({ userId: user.id, email: user.email ?? "", role: user.role, mfaPending });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        await trackEvent({ userId: user.id, eventType: "login" });
        await updateLastSignedIn(user.id);
        return { success: true, mfaRequired: false, mfaPending, challengeToken: null, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),

    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().min(1).max(100),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getUserByEmail(input.email.trim().toLowerCase());
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists. Please sign in instead." });
        const passwordHash = await hashPassword(input.password);
        const user = await createNativeUser({ email: input.email.trim().toLowerCase(), name: input.name.trim(), passwordHash, role: "user" });
        // Auto-login after registration
        const token = await createSessionToken({ userId: user.id, email: user.email ?? "", role: user.role });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        await trackEvent({ userId: user.id, eventType: "login" });
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),

    // Validate invite token (for pre-filling the claim form)
    validateInvite: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const invite = await getInviteByToken(input.token);
        if (!invite) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invite link." });
        if (invite.used) throw new TRPCError({ code: "BAD_REQUEST", message: "This invite has already been used." });
        if (new Date() > invite.expiresAt) throw new TRPCError({ code: "BAD_REQUEST", message: "This invite link has expired. Ask your admin to resend." });
        return { email: invite.email, name: invite.name ?? "", role: invite.role };
      }),
    // Claim an invite: set name + password, auto-login
    acceptInvite: publicProcedure
      .input(z.object({
        token: z.string(),
        name: z.string().min(1).max(100),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }))
      .mutation(async ({ ctx, input }) => {
        const passwordHash = await hashPassword(input.password);
        const user = await claimInvite({ token: input.token, name: input.name, passwordHash });
        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to claim invite." });
        // After accepting invite, user has no MFA yet — mark pending
        const sessionToken = await createSessionToken({ userId: user.id, email: user.email ?? "", role: user.role, mfaPending: true });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        await trackEvent({ userId: user.id, eventType: "login" });
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),
    googleAuth: publicProcedure
      .input(z.object({ code: z.string(), redirectUri: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Google OAuth not configured" });
        }
        // Exchange code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code: input.code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: input.redirectUri,
            grant_type: "authorization_code",
          }),
        });
        if (!tokenRes.ok) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to exchange Google code" });
        }
        const tokenData = await tokenRes.json() as { access_token: string };
        // Get user profile
        const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        if (!profileRes.ok) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to get Google profile" });
        }
        const profile = await profileRes.json() as { id: string; email: string; name: string; picture?: string };
        const user = await upsertGoogleUser({
          googleId: profile.id,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.picture,
        });
        const token = await createSessionToken({ userId: user.id, email: user.email ?? "", role: user.role });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        await trackEvent({ userId: user.id, eventType: "login" });
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),

    createUser: superAdminProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().min(1),
        password: z.string().min(8),
        role: z.enum(["user", "viewer"]).default("user"),
      }))
      .mutation(async ({ input }) => {
        const existing = await getUserByEmail(input.email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });
        const passwordHash = await hashPassword(input.password);
        const user = await createNativeUser({ email: input.email, name: input.name, passwordHash, role: input.role });
        return { success: true, userId: user.id };
      }),

    // ── Check if email exists (for login page — no email sent) ──────────────
    checkEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        const email = input.email.trim().toLowerCase();
        const user = await getUserByEmail(email);
        if (!user || !user.isActive) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "No account found for this email. Contact your admin if you need access." });
        }
        // Create session directly — no email needed
        const sessionToken = await createSessionToken({ userId: user.id, email: user.email ?? "", role: user.role });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        await trackEvent({ userId: user.id, eventType: "login" });
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),
    // ── Magic Link: request a login link (existing users only) ──────────────
    requestMagicLink: publicProcedure
      .input(z.object({ email: z.string().email(), next: z.string().optional() }))
      .mutation(async ({ input }) => {
        const email = input.email.trim().toLowerCase();
        const user = await getUserByEmail(email);
        // Always return success to avoid email enumeration
        if (!user || !user.isActive) return { success: true };
        const token = await createMagicToken(email, "login", user.id);
        const baseUrl = process.env.VITE_APP_URL ?? "https://wavvsuccesscenter.manus.space";
        const nextParam = input.next ? `&next=${encodeURIComponent(input.next)}` : "";
        const link = `${baseUrl}/auth/magic?token=${token}${nextParam}`;
        await notifyOwner({
          title: `Magic link requested by ${user.name ?? email}`,
          content: `Login link for ${email}:\n${link}\n\nThis link expires in 24 hours.`,
        });
        return { success: true };
      }),
    // ── Magic Link: verify token and create session ───────────────────────
    verifyMagicLink: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const result = await validateMagicToken(input.token);
        if (!result) throw new TRPCError({ code: "UNAUTHORIZED", message: "This link is invalid or has expired. Please request a new one." });
        let user = await getUserByEmail(result.email);
        if (!user) {
          // Invite flow: create the user account on first use
          user = await createNativeUser({ email: result.email, name: result.email.split("@")[0], passwordHash: null, role: "viewer" });
        }
        if (!user.isActive) throw new TRPCError({ code: "FORBIDDEN", message: "This account has been deactivated." });
        const sessionToken = await createSessionToken({ userId: user.id, email: user.email ?? "", role: user.role });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        await trackEvent({ userId: user.id, eventType: "login" });
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    // ── MFA: Get setup data by token (public — used by the setup page to fetch QR code) ──
    getMfaSetupData: publicProcedure
      .input(z.object({ setupToken: z.string() }))
      .query(async ({ input }) => {
        const user = await getUserByMfaSetupToken(input.setupToken);
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired setup link." });
        if (!user.mfaSetupTokenExpiresAt || Date.now() > user.mfaSetupTokenExpiresAt) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "This setup link has expired. Ask your admin to generate a new one." });
        }
        // Regenerate QR from the stored secret (secret was already saved when admin generated the link)
        const otplib = await import("otplib");
        const QRCode = await import("qrcode");
        const otpAuthUrl = otplib.generateURI({ label: user.email ?? user.name ?? "user", issuer: "WAVV Success Center", secret: user.mfaSecret! });
        const qrDataUrl = await QRCode.default.toDataURL(otpAuthUrl);
        return { qrDataUrl, secret: user.mfaSecret! };
      }),

    // ── MFA: Initiate setup for self (called by a logged-in user who has mfaPending) ──
    initiateMfaSetupForSelf: protectedProcedure
      .mutation(async ({ ctx }) => {
        const otplib = await import("otplib");
        const cryptoMod = await import("crypto");
        // Reuse existing secret if one exists — prevents duplicate Authenticator entries
        const existingUser = await getUserById(ctx.user.id);
        const secret = existingUser?.mfaSecret ?? otplib.generateSecret();
        const setupToken = cryptoMod.randomBytes(32).toString("hex");
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await setMfaSetupToken(ctx.user.id, secret, setupToken, expiresAt);
        return { setupToken };
      }),

    // ── MFA: Generate setup (called by admin when creating/resetting MFA for a user) ──
    generateMfaSetup: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Only owner or partner_admin can generate setup links for others; users can generate their own
        const isAdmin = ctx.user.role === "owner" || ctx.user.role === "viewer" || ctx.user.role === "publisher" || ctx.user.role === "partner_manager";
        if (!isAdmin && ctx.user.id !== input.userId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        const otplib = await import("otplib");
        const cryptoMod = await import("crypto");
        const targetUser = await getUserById(input.userId);
        if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        const secret = otplib.generateSecret();
        const setupToken = cryptoMod.randomBytes(32).toString("hex");
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await setMfaSetupToken(input.userId, secret, setupToken, expiresAt);
        const otpAuthUrl = otplib.generateURI({ label: targetUser.email ?? targetUser.name ?? "user", issuer: "WAVV Success Center", secret });
        const QRCode = await import("qrcode");
        const qrDataUrl = await QRCode.default.toDataURL(otpAuthUrl);
        return { setupToken, qrDataUrl, secret, otpAuthUrl };
      }),

    // ── MFA: Verify setup (user scans QR, enters first code to confirm) ──
    verifyMfaSetup: publicProcedure
      .input(z.object({ setupToken: z.string(), code: z.string().length(6) }))
      .mutation(async ({ ctx }) => {
        // Intentionally public — user is not yet authenticated
        const input = ctx.req.body as { setupToken: string; code: string };
        void input;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Use verifyMfaSetupByToken" });
      }),

    // ── MFA: Verify setup token + code, activate MFA ──
    verifyMfaSetupByToken: publicProcedure
      .input(z.object({ setupToken: z.string(), code: z.string().min(6).max(6) }))
      .mutation(async ({ ctx, input }) => {
        const user = await getUserByMfaSetupToken(input.setupToken);
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired setup link." });
        if (!user.mfaSetupTokenExpiresAt || Date.now() > user.mfaSetupTokenExpiresAt) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "This setup link has expired. Ask your admin to generate a new one." });
        }
        const otplibSetup = await import("otplib");
        const verifyResultSetup = await otplibSetup.verify({ token: input.code, secret: user.mfaSecret! });
        if (!verifyResultSetup || (typeof verifyResultSetup === 'object' && !verifyResultSetup.valid)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect code. Please try again." });
        }
        await activateMfa(user.id);
        // Issue a full session after successful MFA setup — mfaPending cleared
        const sessionToken = await createSessionToken({ userId: user.id, email: user.email ?? "", role: user.role, mfaPending: false });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        await trackEvent({ userId: user.id, eventType: "login" });
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),

    // ── MFA: Verify login code (step 2 of login when MFA is enabled) ──
    verifyMfaLogin: publicProcedure
      .input(z.object({ challengeToken: z.string(), code: z.string().min(6).max(6) }))
      .mutation(async ({ ctx, input }) => {
        // The challenge token was stored in mfa_setup_token field with a 10-min expiry
        const user = await getUserByMfaSetupToken(input.challengeToken);
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired challenge. Please sign in again." });
        if (!user.mfaSetupTokenExpiresAt || Date.now() > user.mfaSetupTokenExpiresAt) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Challenge expired. Please sign in again." });
        }
        const otplibLogin = await import("otplib");
        const verifyResultLogin = await otplibLogin.verify({ token: input.code, secret: user.mfaSecret! });
        if (!verifyResultLogin || (typeof verifyResultLogin === 'object' && !verifyResultLogin.valid)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect code. Please try again." });
        }
        // Clear the challenge token
        await setMfaSetupToken(user.id, user.mfaSecret!, "", 0);
        const sessionToken = await createSessionToken({ userId: user.id, email: user.email ?? "", role: user.role });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        await trackEvent({ userId: user.id, eventType: "login" });
        await updateLastSignedIn(user.id);
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),

    // ── MFA: Reset (admin clears MFA for a user) ──
    resetMfa: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const isAdmin = ctx.user.role === "owner" || ctx.user.role === "viewer" || ctx.user.role === "publisher" || ctx.user.role === "partner_manager";
        if (!isAdmin) throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        await resetMfa(input.userId);
        return { success: true };
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
        origin: z.string().url(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Create the user stub
        const result = await createManualUser({ name: input.name, email: input.email, role: input.role });
        if (!result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
        // Generate invite token so the user can claim their account
        const { token } = await generateInvite({
          email: input.email,
          name: input.name,
          role: input.role,
          createdBy: ctx.user.id,
        });
        const inviteUrl = `${input.origin}/accept-invite?token=${token}`;
        return { success: true, inviteUrl };
      }),
    // Generate a fresh invite link for an existing user (resend)
    resendInvite: superAdminProcedure
      .input(z.object({
        email: z.string().email(),
        role: z.enum(["viewer", "publisher", "partner_manager", "partner", "owner"]).default("viewer"),
        origin: z.string().url(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { token } = await generateInvite({
          email: input.email,
          role: input.role,
          createdBy: ctx.user.id,
        });
        const inviteUrl = `${input.origin}/accept-invite?token=${token}`;
        return { success: true, inviteUrl };
      }),
    // Invite team member: create user stub + generate accept-invite link for password setup
    inviteTeamMember: ownerProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
        role: z.enum(["owner", "publisher", "partner_manager", "viewer"]).default("viewer"),
        origin: z.string().url().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const email = input.email.trim().toLowerCase();
        // Create or update user stub (no password yet)
        let user = await getUserByEmail(email);
        if (!user) {
          user = await createNativeUser({ email, name: input.name.trim(), passwordHash: null, role: input.role });
        } else {
          // Update role if user already exists
          await updateUserRole(user.id, input.role);
        }
        // Generate accept-invite token so they set their own password
        const { token } = await generateInvite({
          email,
          name: input.name.trim(),
          role: input.role,
          createdBy: ctx.user.id,
        });
        const appUrl = input.origin ?? process.env.VITE_APP_URL ?? "https://wavvsuccesscenter.manus.space";
        const inviteLink = `${appUrl}/accept-invite?token=${token}`;
        await notifyOwner({
          title: `Team invite created for ${input.name} (${input.role})`,
          content: `Invite link for ${email}:\n${inviteLink}\n\nRole: ${input.role}\nThis link expires in 24 hours. Share it directly with the user.`,
        });
        return { success: true, inviteLink, role: input.role };
      }),
    // Bulk invite: create multiple users at once from a list of {name, email, role} entries
    bulkInviteTeamMembers: ownerProcedure
      .input(z.object({
        entries: z.array(z.object({
          name: z.string().min(1).max(255),
          email: z.string().email(),
          role: z.enum(["owner", "publisher", "partner_manager", "viewer"]).default("viewer"),
        })).min(1).max(50),
        origin: z.string().url().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const appUrl = input.origin ?? process.env.VITE_APP_URL ?? "https://wavvsuccesscenter.manus.space";
        const results: { email: string; name: string; inviteLink: string; status: "created" | "updated" | "error"; error?: string }[] = [];
        for (const entry of input.entries) {
          try {
            const email = entry.email.trim().toLowerCase();
            let user = await getUserByEmail(email);
            if (!user) {
              user = await createNativeUser({ email, name: entry.name.trim(), passwordHash: null, role: entry.role });
            } else {
              await updateUserRole(user.id, entry.role);
            }
            const { token } = await generateInvite({
              email,
              name: entry.name.trim(),
              role: entry.role,
              createdBy: ctx.user.id,
            });
            const inviteLink = `${appUrl}/accept-invite?token=${token}`;
            results.push({ email, name: entry.name.trim(), inviteLink, status: user ? "updated" : "created" });
          } catch (err) {
            results.push({ email: entry.email, name: entry.name, inviteLink: "", status: "error", error: err instanceof Error ? err.message : "Unknown error" });
          }
        }
        const successCount = results.filter(r => r.status !== "error").length;
        await notifyOwner({
          title: `Bulk invite: ${successCount}/${input.entries.length} users invited`,
          content: results.map(r => `${r.email}: ${r.status}${r.error ? ` (${r.error})` : ""}`).join("\n"),
        });
        return { results };
      }),

    // Owner-triggered password reset: generates a fresh accept-invite link for an existing user
    sendPasswordReset: ownerProcedure
      .input(z.object({
        userId: z.number(),
        origin: z.string().url().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const allUsers = await getAllUsers();
        const target = allUsers.find(u => u.id === input.userId);
        if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        if (!target.email) throw new TRPCError({ code: "BAD_REQUEST", message: "User has no email address" });
        const { token } = await generateInvite({
          email: target.email,
          name: target.name ?? target.email,
          role: target.role as "viewer" | "publisher" | "partner_manager" | "partner" | "owner",
          createdBy: ctx.user.id,
        });
        const appUrl = input.origin ?? process.env.VITE_APP_URL ?? "https://wavvsuccesscenter.manus.space";
        const resetLink = `${appUrl}/accept-invite?token=${token}`;
        await notifyOwner({
          title: `Password reset link generated for ${target.name ?? target.email}`,
          content: `Reset link for ${target.email}:\n${resetLink}\n\nThis link expires in 24 hours. Share it directly with the user.`,
        });
        return { success: true, resetLink };
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
        if (input.q.trim().length < 2) return { courses: [], lessons: [], webinars: [], guides: [] };
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
      .mutation(async ({ input, ctx }) => {
        const email = input.email.trim().toLowerCase();
        let user = await getUserByEmail(email);
        if (!user) {
          user = await createNativeUser({ email, name: input.name.trim(), passwordHash: null, role: "partner" });
        } else {
          await updateUserRole(user.id, "partner");
        }
        const { token } = await generateInvite({
          email,
          name: input.name.trim(),
          role: "partner",
          createdBy: ctx.user.id,
        });
        const appUrl = input.origin ?? process.env.VITE_APP_URL ?? "https://wavvsuccesscenter.manus.space";
        const inviteLink = `${appUrl}/accept-invite?token=${token}`;
        await notifyOwner({
          title: `WAVV Partner invite created for ${input.name}`,
          content: `Invite link for ${email}:\n${inviteLink}\n\nThis link expires in 24 hours.`,
        });
        return { success: true, inviteLink };
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
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(() => getAllHelpArticles()),

    // Admin: list all collections (including hidden)
    adminListCollections: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(() => getAllHelpCollections()),

    // Admin: toggle article visibility
    setArticleVisible: protectedProcedure
      .input(z.object({ id: z.number(), visible: z.boolean() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => setHelpArticleVisible(input.id, input.visible)),

    // Admin: toggle collection visibility
    setCollectionVisible: protectedProcedure
      .input(z.object({ id: z.number(), visible: z.boolean() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => setHelpCollectionVisible(input.id, input.visible)),

    // Admin: trigger manual sync from Intercom
    sync: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
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
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => publishHelpArticle(input)),

    // Admin: unpublish (remove from customer-facing section)
    unpublish: protectedProcedure
      .input(z.object({ intercomArticleId: z.string() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => unpublishHelpArticle(input.intercomArticleId)),

    // Admin: update section assignment for a published article
    updateSection: protectedProcedure
      .input(z.object({ intercomArticleId: z.string(), sectionName: z.string().min(1) }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
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
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => reorderPublishedArticles(input)),

    // ── Help Article Sections (named groups for customer-facing display) ──────
    // Public: list visible sections only
    listSections: publicProcedure.query(() => getVisibleHelpArticleSections()),

    // Admin: list all sections (including hidden)
    listSectionsAdmin: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(() => getHelpArticleSections()),

    // Admin: toggle section visibility
    toggleSectionVisibility: protectedProcedure
      .input(z.object({ id: z.number(), isVisible: z.boolean() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => toggleHelpArticleSectionVisibility(input.id, input.isVisible)),

    // Admin: create a new section
    createSection: protectedProcedure
      .input(z.object({ name: z.string().min(1) }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => createHelpArticleSection(input.name)),

    // Admin: delete a section
    deleteSection: protectedProcedure
      .input(z.object({ id: z.number() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => deleteHelpArticleSection(input.id)),

    // Admin: rename a section
    renameSection: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1) }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => renameHelpArticleSection(input.id, input.name)),

    // Admin: reorder sections
    reorderSections: protectedProcedure
      .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "viewer" && ctx.user.role !== "publisher" && ctx.user.role !== "owner") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => reorderHelpArticleSections(input)),
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
