CREATE TABLE `help_article_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `help_article_sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `help_article_sections_name_unique` UNIQUE(`name`)
);
