ALTER TABLE `accelerator_content` ADD `coming_soon` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `accelerator_content` ADD `cheat_sheet_url` text;--> statement-breakpoint
ALTER TABLE `accelerator_sessions` ADD `registration_url` text;--> statement-breakpoint
ALTER TABLE `accelerator_sessions` ADD `session_date_time` timestamp;--> statement-breakpoint
ALTER TABLE `accelerator_sessions` ADD `cheat_sheet_url` text;--> statement-breakpoint
ALTER TABLE `accelerator_sessions` ADD `coming_soon` boolean DEFAULT false NOT NULL;