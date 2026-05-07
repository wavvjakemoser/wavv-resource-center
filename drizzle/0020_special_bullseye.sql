CREATE TABLE `invite_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`token` varchar(128) NOT NULL,
	`role` enum('user','admin','super_admin') NOT NULL DEFAULT 'user',
	`used` boolean NOT NULL DEFAULT false,
	`expiresAt` timestamp NOT NULL,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invite_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `invite_tokens_token_unique` UNIQUE(`token`)
);
