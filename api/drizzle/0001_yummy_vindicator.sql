ALTER TABLE "users" RENAME TO "cats";--> statement-breakpoint
ALTER TABLE "cats" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "cats" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "cats" ADD COLUMN "first_name" varchar(50);--> statement-breakpoint
ALTER TABLE "cats" ADD COLUMN "last_name" varchar(50);--> statement-breakpoint
ALTER TABLE "cats" ADD COLUMN "contacts" varchar(255);--> statement-breakpoint
ALTER TABLE "cats" ADD CONSTRAINT "cats_username_unique" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "cats" ADD CONSTRAINT "cats_email_unique" UNIQUE("email");