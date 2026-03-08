/* Stem function: detects language by script, applies correct stemmer */
CREATE OR REPLACE FUNCTION stem_tag(word text) RETURNS text AS $$
DECLARE
  result text[];
BEGIN
  -- кириллица -> русский стеммер
  IF word ~ '[а-яёА-ЯЁ]' THEN
    result := ts_lexize('russian_stem', word);
    IF result IS NOT NULL AND array_length(result, 1) > 0 THEN
      RETURN result[1];
    END IF;
  END IF;

  -- латиница -> английский стеммер
  IF word ~ '[a-zA-Z]' THEN
    result := ts_lexize('english_stem', word);
    IF result IS NOT NULL AND array_length(result, 1) > 0 THEN
      RETURN result[1];
    END IF;
  END IF;

  -- fallback: lowercase
  RETURN lower(word);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
--> statement-breakpoint
ALTER TABLE "meow_tags" ADD COLUMN "stem" varchar(100);
--> statement-breakpoint
UPDATE "meow_tags" SET "stem" = stem_tag("tag");
--> statement-breakpoint
ALTER TABLE "meow_tags" ALTER COLUMN "stem" SET NOT NULL;
--> statement-breakpoint
CREATE INDEX "meow_tags_stem_idx" ON "meow_tags" ("stem");
