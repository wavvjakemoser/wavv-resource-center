ALTER TABLE `published_help_articles` MODIFY COLUMN `intercom_article_id` varchar(64);--> statement-breakpoint
ALTER TABLE `published_help_articles` ADD `source` enum('intercom','native') DEFAULT 'intercom' NOT NULL;--> statement-breakpoint
ALTER TABLE `published_help_articles` ADD `native_body` mediumtext;--> statement-breakpoint
ALTER TABLE `published_help_articles` ADD `native_author_name` varchar(255);