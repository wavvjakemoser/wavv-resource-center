CREATE TABLE `accelerator_live_calls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_number` int NOT NULL,
	`call_number` int NOT NULL DEFAULT 1,
	`title` varchar(255) NOT NULL,
	`description` text,
	`scheduled_at` timestamp NOT NULL,
	`duration_minutes` int NOT NULL DEFAULT 90,
	`registration_url` text,
	`join_url` text,
	`thumbnail_url` text,
	`is_visible` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accelerator_live_calls_id` PRIMARY KEY(`id`)
);
