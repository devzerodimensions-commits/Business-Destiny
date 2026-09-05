import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const content = sqliteTable('content', {
  id: text('id').primaryKey(),
  value: text('value').notNull(),
  updated: integer('updated').notNull(),
});
export const sessions = sqliteTable('sessions', {
  token: text('token').primaryKey(),
  expires: integer('expires').notNull(),
});
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  value: text('value').notNull(),
});
export const enquiries = sqliteTable('enquiries', {
  id: text('id').primaryKey(),
  data: text('data').notNull(),
  created: integer('created').notNull(),
});
export const limits = sqliteTable('limits', {
  id: text('id').primaryKey(),
  count: integer('count').notNull(),
  expires: integer('expires').notNull(),
});
