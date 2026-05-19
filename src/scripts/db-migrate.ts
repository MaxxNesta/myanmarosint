import { execSync } from 'child_process'

// Loaded via: tsx --env-file=.env.local src/scripts/db-migrate.ts
// Pushes the current Prisma schema to the database using the loaded DATABASE_URL.
execSync('npx prisma db push', { stdio: 'inherit', env: process.env })
