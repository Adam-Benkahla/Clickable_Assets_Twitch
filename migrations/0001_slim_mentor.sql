CREATE TABLE IF NOT EXISTS "encarts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"label" varchar(100),
	"x" integer DEFAULT 0 NOT NULL,
	"y" integer DEFAULT 0 NOT NULL,
	"width" integer DEFAULT 200 NOT NULL,
	"height" integer DEFAULT 80 NOT NULL,
	"file_url" text,
	"link_url" text,
	"background" varchar(20) DEFAULT '#ffffff',
	"text_field" text,
	"entry_animation" varchar(50),
	"exit_animation" varchar(50),
	"entry_animation_duration" integer DEFAULT 1000,
	"exit_animation_duration" integer DEFAULT 1000,
	"delay_between_appearances" integer DEFAULT 5000,
	"display_duration" integer DEFAULT 3000
);
