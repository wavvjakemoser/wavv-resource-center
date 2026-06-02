CREATE TABLE `partner_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageTarget` enum('public','portal') NOT NULL,
	`blockType` enum('hero','module','resource_card','quick_link') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`linkUrl` varchar(500),
	`status` enum('coming_soon','live') DEFAULT 'coming_soon',
	`isLocked` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isVisible` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `guides` MODIFY COLUMN `fileType` enum('pdf','checklist','playbook','other','help_article') DEFAULT 'pdf';--> statement-breakpoint
ALTER TABLE `users` ADD `password_reset_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `password_reset_expires` bigint;