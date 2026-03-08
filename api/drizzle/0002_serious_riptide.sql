CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meow_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"content" text NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"user_id" uuid NOT NULL,
	"meow_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "likes_user_id_meow_id_pk" PRIMARY KEY("user_id","meow_id")
);
--> statement-breakpoint
CREATE TABLE "meow_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meow_id" uuid NOT NULL,
	"tag" varchar(100) NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_meow_id_meows_id_fk" FOREIGN KEY ("meow_id") REFERENCES "public"."meows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_cats_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."cats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_cats_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_meow_id_meows_id_fk" FOREIGN KEY ("meow_id") REFERENCES "public"."meows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meow_tags" ADD CONSTRAINT "meow_tags_meow_id_meows_id_fk" FOREIGN KEY ("meow_id") REFERENCES "public"."meows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meows" ADD CONSTRAINT "meows_author_id_cats_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."cats"("id") ON DELETE cascade ON UPDATE no action;