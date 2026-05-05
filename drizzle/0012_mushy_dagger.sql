ALTER TABLE `lessons` ADD `starred` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `lessons` ADD `hidden` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `lessons` ADD `fileUrl` text;