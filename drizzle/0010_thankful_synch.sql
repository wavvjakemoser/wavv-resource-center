CREATE TABLE `content_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`requestType` enum('video','guide','webinar') NOT NULL,
	`topic` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`formatPreference` varchar(100),
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `googleId` varchar(255);--> statement-breakpoint
ALTER TABLE `webinars` ADD `thumbnail_url` varchar(500);--> statement-breakpoint
ALTER TABLE `webinars` ADD `accent_color` varchar(20);--> statement-breakpoint
ALTER TABLE `webinars` DROP COLUMN `thumbnailUrl`;--> statement-breakpoint
ALTER TABLE `webinars` DROP COLUMN `accentColor`;