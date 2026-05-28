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
import { getUserByEmail, createNativeUser, upsertGoogleUser, generateInvite, getInviteByToken, claimInvite, createMagicToken, validateMagicToken } from "./db";
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
} from "./db";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});
const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "super_admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Super admin access required" });
  }
  return next({ ctx });
});

// ─── Academy Router ───────────────────────────────────────────────────────────
const academyRouter = router({
  getCourses: protectedProcedure.query(async () => {
    const allCourses = await getCourses(true);
    const enriched = await Promise.all(
      allCourses.map(async (c) => {
        const courseLessons = await getLessonsByCourse(c.id, true);
        return { ...c, lessonCount: courseLessons.length };
      })
    );
    return enriched;
  }),

  getCourse: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const course = await getCourseById(input.id);
      // Unpublished courses are hidden from regular users; admins can still access
      const isAdmin = ctx.user.role === "admin" || ctx.user.role === "super_admin";
      if (!course || (!course.published && !isAdmin)) throw new TRPCError({ code: "NOT_FOUND" });
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

  getLessonsByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => getLessonsByCategory(input.category)),

  // Returns courses (sections) for a given category — includes tags field for user-facing display
  getCoursesByCategory: protectedProcedure
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
  getCategories: protectedProcedure.query(() => getCategories()),

  // Reorder: swap sortOrder between two courses (super_admin only)
  reorderCourses: superAdminProcedure
    .input(z.object({ id1: z.number(), id2: z.number() }))
    .mutation(({ input }) => reorderCourses(input.id1, input.id2)),

  // Reorder: swap sortOrder between two lessons (super_admin only)
  reorderLessons: superAdminProcedure
    .input(z.object({ id1: z.number(), id2: z.number() }))
    .mutation(({ input }) => reorderLessons(input.id1, input.id2)),

  // ─── Section Resources (standalone PDFs per section) ─────────────────────
  // List all section resources (admin view — includes courseTitle + courseCategory)
  adminGetSectionResources: adminProcedure
    .query(() => getAllSectionResources()),

  // List section resources for a specific category (user-facing)
  getSectionResourcesByCategory: protectedProcedure
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
          published: z.boolean().optional(),
        }),
      })
    )
    .mutation(({ input }) => updateWebinar(input.id, input.data)),

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
  // Reorder: swap sortOrder between two webinars (super_admin only)
  adminReorder: superAdminProcedure
    .input(z.object({ id1: z.number(), id2: z.number() }))
    .mutation(({ input }) => reorderWebinars(input.id1, input.id2)),
});

// ─── Guides Router ────────────────────────────────────────────────────────────
const guidesRouter = router({
  list: protectedProcedure.query(() => getGuides(true)),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const guide = await getGuideById(input.id);
      if (!guide) throw new TRPCError({ code: "NOT_FOUND" });
      return guide;
    }),

  download: protectedProcedure
    .input(z.object({ guideId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await incrementGuideDownload(input.guideId);
      await trackEvent({
        userId: ctx.user.id,
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
        // fileType maps to the category section: pdf | checklist | playbook | other(=Resource)
        fileType: z.enum(["pdf", "checklist", "playbook", "other"]).optional(),
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
          fileType: z.enum(["pdf", "checklist", "playbook", "other"]).optional(),
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

  // Reorder: swap sortOrder between two guides (super_admin only)
  adminReorder: superAdminProcedure
    .input(z.object({ id1: z.number(), id2: z.number() }))
    .mutation(({ input }) => reorderGuides(input.id1, input.id2)),
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
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
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
      // Never expose passwordHash or other sensitive fields to the client
      const { passwordHash: _ph, openId: _oid, ...safeUser } = u;
      return safeUser;
    }),

    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        // ── DEMO MODE: any credentials accepted ──────────────────────────────
        // TODO: Remove this block before production launch
        const DEMO_MODE = true;
        if (DEMO_MODE) {
          // Try real credentials first; fall back to demo user
          let demoUser = await getUserByEmail(input.email);
          if (!demoUser) {
            // Fall back to Jake's account as the demo user
            demoUser = await getUserByEmail("jake@wavv.com");
          }
          if (demoUser) {
            const token = await createSessionToken({ userId: demoUser.id, email: demoUser.email ?? "", role: demoUser.role });
            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
            await trackEvent({ userId: demoUser.id, eventType: "login" });
            return { success: true, user: { id: demoUser.id, name: demoUser.name, email: demoUser.email, role: demoUser.role } };
          }
        }
        // ── END DEMO MODE ────────────────────────────────────────────────────
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash || !user.isActive) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        const valid = await verifyPassword(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        const token = await createSessionToken({ userId: user.id, email: user.email ?? "", role: user.role });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        await trackEvent({ userId: user.id, eventType: "login" });
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
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
        const sessionToken = await createSessionToken({ userId: user.id, email: user.email ?? "", role: user.role });
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
        role: z.enum(["user", "admin"]).default("user"),
      }))
      .mutation(async ({ input }) => {
        const existing = await getUserByEmail(input.email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });
        const passwordHash = await hashPassword(input.password);
        const user = await createNativeUser({ email: input.email, name: input.name, passwordHash, role: input.role });
        return { success: true, userId: user.id };
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
          user = await createNativeUser({ email: result.email, name: result.email.split("@")[0], passwordHash: null, role: "admin" });
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
  }),
  academy: academyRouter,
  webinars: webinarsRouter,
  guides: guidesRouter,
  support: supportRouter,
  wavvAi: wavvAiRouter,
  analytics: analyticsRouter,
  scheduled: scheduledRouter,
  admin: router({
    listUsers: superAdminProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const allUsersData = await getAllUsers();
        const search = input?.search?.trim().toLowerCase();
        if (!search) return allUsersData;
        return allUsersData.filter(
          (u) =>
            (u.name ?? "").toLowerCase().includes(search) ||
            (u.email ?? "").toLowerCase().includes(search)
        );
      }),
    updateRole: superAdminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin", "super_admin"]) }))
      .mutation(async ({ ctx, input }) => {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot change your own role" });
        }
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    removeUser: superAdminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot remove yourself" });
        }
        // Admins can only remove users (not other admins or super_admins)
        // Super admins can remove anyone
        const allUsers = await getAllUsers();
        const target = allUsers.find(u => u.id === input.userId);
        if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        if (ctx.user.role === "admin" && (target.role === "admin" || target.role === "super_admin")) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admins can only remove standard users" });
        }
        await deleteUser(input.userId);
        return { success: true };
      }),
    getUserStats: superAdminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const stats = await getUserStats(input.userId);
        if (!stats) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        return stats;
      }),
    addUser: superAdminProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
        role: z.enum(["user", "admin", "super_admin"]).default("user"),
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
        role: z.enum(["user", "admin", "super_admin"]).default("user"),
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
    // Magic link invite: create user + send them a login link
    inviteTeamMember: superAdminProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const email = input.email.trim().toLowerCase();
        let user = await getUserByEmail(email);
        if (!user) {
          user = await createNativeUser({ email, name: input.name.trim(), passwordHash: null, role: "admin" });
        }
        const token = await createMagicToken(email, "invite", user.id);
        const appUrl = process.env.VITE_APP_URL ?? "https://wavvsuccesscenter.manus.space";
        const link = `${appUrl}/auth/magic?token=${token}`;
        await notifyOwner({
          title: `Team invite sent to ${input.name}`,
          content: `Invite link for ${email}:\n${link}\n\nThis link expires in 24 hours.`,
        });
        return { success: true, inviteLink: link };
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
    query: protectedProcedure
      .input(z.object({ q: z.string().min(1).max(200) }))
      .query(async ({ ctx, input }) => {
        if (input.q.trim().length < 2) return { courses: [], lessons: [], webinars: [], guides: [] };
        await trackEvent({ userId: ctx.user.id, eventType: "search", metadata: JSON.stringify({ query: input.q.trim() }) });
        return searchContent(input.q.trim());
      }),
  }),
  trophy: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserTrophies(ctx.user.id);
    }),
  }),
  tracking: router({
    pageView: protectedProcedure
      .input(z.object({ path: z.string().max(500) }))
      .mutation(async ({ ctx, input }) => {
        await trackEvent({
          userId: ctx.user.id,
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

    adminList: superAdminProcedure
      .input(z.object({ requestType: z.enum(["video", "guide", "webinar"]).optional() }))
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
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const { getSiteSetting } = await import("./db");
        return getSiteSetting(input.key);
      }),
    update: protectedProcedure
      .input(z.object({ key: z.string(), value: z.record(z.string(), z.boolean()) }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "super_admin") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(async ({ input }) => {
        const { upsertSiteSetting } = await import("./db");
        await upsertSiteSetting(input.key, input.value as Record<string, boolean>);
        return { success: true };
      }),
  }),
  readiness: router({
    getItems: protectedProcedure
      .input(z.object({ page: z.enum(["academy", "webinars", "guides", "playground", "support"]) }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "super_admin") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(({ input }) => getReadinessItems(input.page)),

    toggleItem: protectedProcedure
      .input(z.object({ id: z.number(), checked: z.boolean() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "super_admin") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .mutation(({ input }) => toggleReadinessItem(input.id, input.checked)),
  }),
});

export type AppRouter = typeof appRouter;
