ALTER TABLE "cats" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;

-- верифицируем trplfr
UPDATE "cats" SET "verified" = true WHERE "username" = 'trplfr';
