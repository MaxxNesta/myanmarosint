import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

export function makePrisma(): PrismaClient {
  const raw  = (process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '')
    .replace(/[?&]connect_timeout=\d+/g, '')
    .replace(/[?&]pgbouncer=true/g, '')
    .replace(/[?&]channel_binding=\w+/g, '')
  const pool    = new Pool({ connectionString: raw })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter }) as unknown as PrismaClient
}
