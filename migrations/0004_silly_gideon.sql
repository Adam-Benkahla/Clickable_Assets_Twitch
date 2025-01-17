CREATE TABLE IF NOT EXISTS "obs_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_name" varchar(255) NOT NULL,
	"scene_name" varchar(255),
	"native_width" integer,
	"native_height" integer,
	"pos_x" double precision,
	"pos_y" double precision,
	"scale_x" double precision,
	"scale_y" double precision,
	"rotation_deg" double precision,
	"final_width" double precision,
	"final_height" double precision,
	"canvas_width" integer,
	"canvas_height" integer,
	"clickable_link" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
