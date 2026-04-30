import { execSync } from 'child_process'

// Loaded via: tsx --env-file=.env.local src/scripts/db-pull.ts
execSync('npx prisma db pull', { stdio: 'inherit', env: process.env })
