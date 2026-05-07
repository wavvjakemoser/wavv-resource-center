CREATE TABLE `section_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `section_resources_id` PRIMARY KEY(`id`)
);
