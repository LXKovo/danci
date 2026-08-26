CREATE TABLE "admin-session" (
	"token_hash" varchar(64) PRIMARY KEY NOT NULL,
	"admin_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin-users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin-users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admin-session" ADD CONSTRAINT "admin-session_admin_id_admin-users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin-users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_session_admin_id_idx" ON "admin-session" USING btree ("admin_id");