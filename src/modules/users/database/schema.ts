import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export interface UserModel {
  id: number;
  name: string;
  email: string;
  user_id: string;
}

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 225 }).notNull(),
  email: varchar({ length: 40 }).notNull().unique(),
  user_id: varchar({ length: 128 }).notNull().unique()
});