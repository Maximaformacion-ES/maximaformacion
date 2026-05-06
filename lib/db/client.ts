import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://strapi:strapi_password@localhost:5432/strapi';

const queryClient = postgres(DATABASE_URL);

export const db = drizzle(queryClient, { schema });

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
