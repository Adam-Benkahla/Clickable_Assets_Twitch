import {
  bigint,
  integer,
  json,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
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
