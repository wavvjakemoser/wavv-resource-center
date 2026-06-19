CREATE TABLE `faq_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section_id` int NOT NULL,
	`question` varchar(500) NOT NULL,
	`answer` text NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_visible` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faq_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faq_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_visible` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faq_sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `faq_sections_name_unique` UNIQUE(`name`)
);
