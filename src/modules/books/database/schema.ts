import { date, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export interface BookModel {
  id: number;
  gutenberg_id: string;
  title: string;
  author: string;
  image_url: string;
  summary?: string;
  published_on: string;
}

export const booksTable = pgTable("books", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  gutenberg_id: varchar({ length: 8 }).notNull().unique(),
  title: varchar({ length: 225 }).notNull(),
  author: varchar({ length: 225 }).notNull(),
  image_url: varchar({ length: 225 }).notNull(),
  summary: varchar({ length: 225 }),
  published_on: varchar({ length: 225 }).notNull(),
})