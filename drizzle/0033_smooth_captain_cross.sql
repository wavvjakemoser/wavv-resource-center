ALTER TABLE `users` ADD `mfa_secret` text;--> statement-breakpoint
ALTER TABLE `users` ADD `mfa_enabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `mfa_setup_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `mfa_setup_token_expires_at` bigint;