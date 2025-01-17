ALTER TABLE "organization" ADD COLUMN "api_key" text;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_api_key_unique" UNIQUE("api_key");