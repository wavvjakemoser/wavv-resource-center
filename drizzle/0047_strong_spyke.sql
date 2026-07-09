ALTER TABLE `users` RENAME COLUMN `wavv_account_id` TO `wavv_user_id`;--> statement-breakpoint
ALTER TABLE `users` ADD `employee_id` varchar(128);