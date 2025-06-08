import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({

    schema: './src/lib/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: 'postgresql://neondb_owner:npg_Bef1SuwDsv6I@ep-calm-wildflower-a8r9j2tg-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
    },
});
