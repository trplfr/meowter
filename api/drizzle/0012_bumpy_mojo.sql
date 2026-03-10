ALTER TABLE "cats" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "meows" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "idx_comments_meow_id" ON "comments" USING btree ("meow_id");--> statement-breakpoint
CREATE INDEX "idx_likes_meow_id" ON "likes" USING btree ("meow_id");--> statement-breakpoint
CREATE INDEX "idx_meow_tags_meow_id" ON "meow_tags" USING btree ("meow_id");--> statement-breakpoint
CREATE INDEX "idx_meow_tags_stem" ON "meow_tags" USING btree ("stem");--> statement-breakpoint
CREATE INDEX "idx_meows_author_id" ON "meows" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_meows_created_at" ON "meows" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_meows_reply_to_id" ON "meows" USING btree ("reply_to_id");--> statement-breakpoint
CREATE INDEX "idx_meows_remeow_of_id" ON "meows" USING btree ("remeow_of_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_read" ON "notifications" USING btree ("user_id","read");