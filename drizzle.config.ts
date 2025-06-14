// drizzle.config.ts or drizzle.config.js

import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

// Manually load .env.local
config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  schema: './src/lib/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_NEON_DB_CONNECTION_STRING!,
  },
});
