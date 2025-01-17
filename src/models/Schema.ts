import {
  bigint,
  doublePrecision,
  integer,
  json,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
    stripeSubscriptionStatus: text('stripe_subscription_status'),
    stripeSubscriptionCurrentPeriodEnd: bigint(
      'stripe_subscription_current_period_end',
      { mode: 'number' },
    ),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
    };
  },
);

export const todoSchema = pgTable('todo', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const encarts = pgTable('encarts', {
  id: text('id').primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull(),
  label: varchar('label', { length: 100 }),
  xPercent: numeric('x_percent').notNull().default('0'),
  yPercent: numeric('y_percent').notNull().default('0'),
  widthPercent: numeric('width_percent').notNull().default('100'),
  heightPercent: numeric('height_percent').notNull().default('100'),
  fileUrl: text('file_url'),
  linkUrl: text('link_url'),
  background: varchar('background', { length: 7 }).default('#ffffff'),
  text: text('text_field'),
  entryAnimation: varchar('entry_animation', { length: 50 }),
  exitAnimation: varchar('exit_animation', { length: 50 }),
  entryAnimationDuration: integer('entry_animation_duration').default(1000),
  exitAnimationDuration: integer('exit_animation_duration').default(1000),
  delayBetweenAppearances: integer('delay_between_appearances').default(5000),
  displayDuration: integer('display_duration').default(3000),
  referenceResolution: json('reference_resolution'), // JSON for width/height reference
});

export const obsAssets = pgTable('obs_assets', {
  id: uuid('id').primaryKey().defaultRandom(), // or .default(uuidGenerateV4())
  source_name: varchar('source_name', { length: 255 }).notNull(),
  scene_name: varchar('scene_name', { length: 255 }),
  native_width: integer('native_width'),
  native_height: integer('native_height'),
  pos_x: doublePrecision('pos_x'),
  pos_y: doublePrecision('pos_y'),
  scale_x: doublePrecision('scale_x'),
  scale_y: doublePrecision('scale_y'),
  rotation_deg: doublePrecision('rotation_deg'),
  final_width: doublePrecision('final_width'),
  final_height: doublePrecision('final_height'),
  canvas_width: integer('canvas_width'),
  canvas_height: integer('canvas_height'),
  clickable_link: text('clickable_link'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
