CREATE TABLE `accelerator_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_number` int NOT NULL,
	`content_type` enum('recording','product_training') NOT NULL,
	`title` varchar(255) NOT NULL,
	`loom_url` text,
	`thumbnail_url` text,
	`host_name` varchar(128),
	`duration` varchar(32),
	`description` text,
	`is_visible` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accelerator_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accelerator_sessions` ADD `join_url` text;