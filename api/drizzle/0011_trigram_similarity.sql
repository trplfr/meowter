/* Enable pg_trgm extension for trigram similarity */
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
/* Enable fuzzystrmatch extension for Levenshtein distance */
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
--> statement-breakpoint
CREATE INDEX "meow_tags_stem_trgm_idx" ON "meow_tags" USING gin ("stem" gin_trgm_ops);
