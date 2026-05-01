CREATE TABLE `analytics_events` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` varchar(100) NOT NULL,
	`resourceType` varchar(50),
	`resourceId` int,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('Onboarding','How-To','Strategy and Best Practices','Dialer Setup','CRM Integrations','Spam Protection') NOT NULL,
	`thumbnailUrl` text,
	`durationMinutes` int DEFAULT 0,
	`sortOrder` int DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`fileUrl` text,
	`fileType` enum('pdf','checklist','playbook','other') DEFAULT 'pdf',
	`downloadCount` int DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`courseId` int NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lesson_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` text,
	`durationMinutes` int DEFAULT 0,
	`sortOrder` int DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(255) NOT NULL,
	`category` enum('Technical Issue','Billing','Feature Request','Onboarding','General Question','Other') NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`description` text NOT NULL,
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webinar_registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`webinarId` int NOT NULL,
	`registeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webinar_registrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webinars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`host` varchar(255),
	`type` enum('upcoming','recording') NOT NULL,
	`scheduledAt` timestamp,
	`registrationUrl` text,
	`videoUrl` text,
	`thumbnailUrl` text,
	`viewCount` int DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webinars_id` PRIMARY KEY(`id`)
);
