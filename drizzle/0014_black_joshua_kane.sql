ALTER TABLE `playground_requests` ADD `lastName` varchar(255);--> statement-breakpoint
ALTER TABLE `playground_requests` ADD `optIn` boolean DEFAULT true NOT NULL;