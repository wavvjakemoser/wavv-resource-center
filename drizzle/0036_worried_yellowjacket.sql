CREATE TABLE `published_help_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`intercom_article_id` varchar(64) NOT NULL,
	`title` varchar(500) NOT NULL,
	`url` text,
	`section_name` varchar(255) NOT NULL DEFAULT 'General',
	`sort_order` int NOT NULL DEFAULT 0,
	`section_order` int NOT NULL DEFAULT 0,
	`published_at` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `published_help_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `published_help_articles_intercom_article_id_unique` UNIQUE(`intercom_article_id`)
);
