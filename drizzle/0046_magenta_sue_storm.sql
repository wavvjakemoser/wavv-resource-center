CREATE TABLE `accelerator_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`week` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`wavv_focus` text,
	`outcome` text,
	`color` varchar(32) NOT NULL DEFAULT '#0074F4',
	`hero_headline` varchar(255),
	`hero_subline` text,
	`body_content` mediumtext,
	`video_url` text,
	`resource_links` text,
	`is_published` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accelerator_sessions_id` PRIMARY KEY(`id`)
);
