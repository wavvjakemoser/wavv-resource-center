CREATE TABLE `page_readiness_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page` enum('academy','webinars','guides','playground','support') NOT NULL,
	`label` varchar(255) NOT NULL,
	`checked` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `page_readiness_items_id` PRIMARY KEY(`id`)
);
