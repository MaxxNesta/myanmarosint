import { neon, neonConfig, Pool } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

async function main() {
  const directUrl = (process.env.DIRECT_URL ?? '').replace(/[?&]connect_timeout=\d+/g, '')
  const dbUrl     = (process.env.DATABASE_URL ?? '').replace(/[?&]pgbouncer=true/g, '').replace(/[?&]connect_timeout=\d+/g, '')

  console.log('DIRECT_URL prefix :', directUrl.slice(0, 75))
  console.log('DATABASE_URL prefix:', dbUrl.slice(0, 75))

  // Test 1: HTTP neon() with direct URL
  try {
    const sql = neon(directUrl)
    const r   = await sql`SELECT 1 as n`
    console.log('✅ neon() HTTP direct:', r)
  } catch (e: any) {
    console.error('❌ neon() HTTP direct:', e.message)
  }

  // Test 2: HTTP neon() with pooler URL
  try {
    const sql = neon(dbUrl)
    const r   = await sql`SELECT 1 as n`
    console.log('✅ neon() HTTP pooler:', r)
  } catch (e: any) {
    console.error('❌ neon() HTTP pooler:', e.message)
  }

  // Test 3: Pool (WebSocket) with direct URL
  try {
    const pool   = new Pool({ connectionString: directUrl })
    const client = await pool.connect()
    const r      = await client.query('SELECT 1 as n')
    client.release()
    await pool.end()
    console.log('✅ Pool WS direct:', r.rows)
  } catch (e: any) {
    console.error('❌ Pool WS direct:', e.message)
  }
}

main().catch(console.error)
