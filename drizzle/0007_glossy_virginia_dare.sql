CREATE TABLE `playground_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`playground` varchar(255) NOT NULL,
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playground_requests_id` PRIMARY KEY(`id`)
);
