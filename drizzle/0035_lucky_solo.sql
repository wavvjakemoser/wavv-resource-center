CREATE TABLE `help_article_collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`intercom_id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`visible` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`synced_at` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `help_article_collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `help_article_collections_intercom_id_unique` UNIQUE(`intercom_id`)
);
--> statement-breakpoint
CREATE TABLE `help_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`intercom_id` varchar(64) NOT NULL,
	`collection_id` varchar(64),
	`title` varchar(500) NOT NULL,
	`body` text,
	`summary` text,
	`url` text,
	`visible` boolean NOT NULL DEFAULT true,
	`state` varchar(32) DEFAULT 'published',
	`author_name` varchar(255),
	`intercom_updated_at` bigint,
	`synced_at` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `help_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `help_articles_intercom_id_unique` UNIQUE(`intercom_id`)
);
