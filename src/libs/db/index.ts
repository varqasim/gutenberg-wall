import dotenv from "dotenv";
import { drizzle } from 'drizzle-orm/node-postgres';

dotenv.config({
  path: process.env.ENVIRONMENT === "prod" ? ".env" : ".env.dev"
});


import { usersTable } from '../../modules/users/database/schema';

export const db = drizzle(process.env.DATABASE_URL!, { logger: true, schema: { ...usersTable } });