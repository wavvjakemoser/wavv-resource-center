ALTER TABLE `users` ADD `wavv_sub` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `account_type` enum('employee','customer','guest') DEFAULT 'guest' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `approval_status` enum('pending','approved','denied') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `is_employee` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `is_customer` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `wavv_account_id` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `subscription_status` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `wavv_plan` varchar(128);