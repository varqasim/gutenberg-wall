import dotenv from "dotenv";
import { defineConfig } from 'drizzle-kit';

dotenv.config({
  path: process.env.ENVIRONMENT === "prod" ? ".env" : ".env.dev"
});

export default defineConfig({
  out: './drizzle',
  schema: [
    './src/modules/users/database/schema.ts'
  ],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});