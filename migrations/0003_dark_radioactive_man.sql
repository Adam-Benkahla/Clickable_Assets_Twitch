ALTER TABLE "encarts" RENAME COLUMN "x" TO "x_percent";--> statement-breakpoint
ALTER TABLE "encarts" RENAME COLUMN "y" TO "y_percent";--> statement-breakpoint
ALTER TABLE "encarts" RENAME COLUMN "width" TO "width_percent";--> statement-breakpoint
ALTER TABLE "encarts" RENAME COLUMN "height" TO "height_percent";--> statement-breakpoint
ALTER TABLE "encarts" ALTER COLUMN "x_percent" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "encarts" ALTER COLUMN "x_percent" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "encarts" ALTER COLUMN "y_percent" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "encarts" ALTER COLUMN "y_percent" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "encarts" ALTER COLUMN "width_percent" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "encarts" ALTER COLUMN "width_percent" SET DEFAULT '100';--> statement-breakpoint
ALTER TABLE "encarts" ALTER COLUMN "height_percent" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "encarts" ALTER COLUMN "height_percent" SET DEFAULT '100';--> statement-breakpoint
ALTER TABLE "encarts" ALTER COLUMN "background" SET DATA TYPE varchar(7);