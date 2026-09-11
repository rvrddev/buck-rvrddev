// lib/schema.ts
import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const months = pgTable('months', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  title: text('title').notNull(),
  mantra: text('mantra').default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const habits = pgTable('habits', {
  id: serial('id').primaryKey(),
  monthId: integer('month_id').notNull().references(() => months.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull().default('routine'),
  position: integer('position').notNull().default(0),
});

export const checks = pgTable('checks', {
  id: serial('id').primaryKey(),
  monthId: integer('month_id').notNull().references(() => months.id, { onDelete: 'cascade' }),
  habitId: integer('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  day: integer('day').notNull(),
  checked: boolean('checked').notNull().default(true),
});

export const objectives = pgTable('objectives', {
  id: serial('id').primaryKey(),
  monthId: integer('month_id').notNull().references(() => months.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  text: text('text').notNull().default(''),
  done: boolean('done').default(false),
  current: integer('current').default(0),
  target: integer('target').default(1),
  weeks: jsonb('weeks').$type<boolean[]>(),
  note: text('note').default(''),
  position: integer('position').notNull().default(0),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  monthId: integer('month_id').notNull().references(() => months.id, { onDelete: 'cascade' }),
  day: integer('day').notNull(),
  text: text('text').notNull().default(''),
});

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  monthId: integer('month_id').notNull().references(() => months.id, { onDelete: 'cascade' }),
  day: integer('day').notNull(),
  text: text('text').notNull().default(''),
});