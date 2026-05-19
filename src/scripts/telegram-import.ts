/**
 * Telegram historical import — fetches messages from all TELEGRAM_SOURCES
 * channels from 2021-02-01 to now using the MTProto API (gramjs).
 *
 * First run:  prompts for phone number + verification code, then prints a
 *             TELEGRAM_SESSION string. Add that to .env.local to skip auth
 *             on future runs.
 *
 * Safe to re-run: messages are deduplicated by their t.me/channel/id URL.
 *
 * Usage:
 *   npm run telegram:import
 */

import { TelegramClient } from 'telegram'
import { StringSession }  from 'telegram/sessions'
import { Api }            from 'telegram'
import { makePrisma }     from './make-prisma'
import * as readline      from 'readline'
import { TELEGRAM_SOURCES } from '../lib/rss'

// ── Credentials (from .env.local) ────────────────────────────────────────────
const API_ID   = Number(process.env.TELEGRAM_API_ID)
const API_HASH = process.env.TELEGRAM_API_HASH ?? ''
const SESSION  = process.env.TELEGRAM_SESSION  ?? ''

const MIN_DATE     = new Date('2021-02-01')
const MIN_DATE_UNIX = Math.floor(MIN_DATE.getTime() / 1000)

const prisma = makePrisma()

// ── Interactive prompt helper ─────────────────────────────────────────────────
function ask(question: string): Promise<string> {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, answer => { rl.close(); resolve(answer.trim()) })
  })
}

// ── Sleep helper ──────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── Per-channel importer ──────────────────────────────────────────────────────
async function importChannel(
  client:     TelegramClient,
  username:   string,
  sourceName: string,
): Promise<{ saved: number; skipped: number; errors: number }> {
  let saved = 0, skipped = 0, errors = 0

  try {
    // Resolve entity once before iterating
    const entity = await client.getEntity(username)

    for await (const message of client.iterMessages(entity, {
      reverse:    true,         // oldest → newest
      offsetDate: MIN_DATE_UNIX,
    })) {
      // Skip non-text messages (photos-only, stickers, etc.)
      if (!(message instanceof Api.Message)) continue
      const text = message.message?.trim()
      if (!text) continue

      // Skip anything before our cutoff (API sometimes returns a few earlier)
      if (message.date < MIN_DATE_UNIX) continue

      const url = `https://t.me/${username}/${message.id}`

      try {
        const exists = await prisma.rawArticle.findUnique({ where: { url } })
        if (exists) { skipped++; continue }

        const firstLine = text.split('\n')[0].trim()
        const title     = firstLine.length > 200
          ? firstLine.slice(0, 197) + '…'
          : firstLine || `Telegram post ${message.id}`

        await prisma.rawArticle.create({
          data: {
            url,
            title,
            content:     `${title}\n\n${text}`.slice(0, 8000),
            sourceName,
            sourceType:  'TELEGRAM',
            publishedAt: new Date(message.date * 1000),
          },
        })
        saved++
      } catch {
        errors++
      }

      // Brief pause every 200 messages to stay under Telegram's rate limits
      if ((saved + skipped) % 200 === 0 && (saved + skipped) > 0) {
        process.stdout.write('.')
        await sleep(800)
      }
    }
  } catch (err: unknown) {
    // Handle FloodWaitError — Telegram tells us how long to wait
    const msg = String(err)
    const floodMatch = msg.match(/FLOOD_WAIT_(\d+)/i) ?? msg.match(/flood.*?(\d+)/i)
    if (floodMatch) {
      const waitSec = Number(floodMatch[1]) + 5
      console.log(`\n  ⏳ Rate limited — waiting ${waitSec}s...`)
      await sleep(waitSec * 1000)
    } else {
      console.error(`\n  ⚠️  ${username}: ${msg.slice(0, 120)}`)
      errors++
    }
  }

  return { saved, skipped, errors }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!API_ID || !API_HASH) {
    console.error('❌ Missing TELEGRAM_API_ID or TELEGRAM_API_HASH in .env.local')
    process.exit(1)
  }

  console.log('🔌 Connecting to Telegram MTProto...')

  const client = new TelegramClient(
    new StringSession(SESSION),
    API_ID,
    API_HASH,
    { connectionRetries: 5 },
  )

  await client.start({
    phoneNumber: () => ask('📱 Phone number (with country code, e.g. +959XXXXXXXX): '),
    phoneCode:   () => ask('🔑 Verification code sent to your Telegram: '),
    password:    () => ask('🔐 2FA password (press Enter if none): '),
    onError:     (err) => console.error('Auth error:', err),
  })

  // Print session string so the user can skip auth on future runs
  const sessionStr = String(client.session.save())
  if (!SESSION && sessionStr) {
    console.log('\n✅ Authenticated! Add this line to .env.local to skip login next time:')
    console.log(`TELEGRAM_SESSION="${sessionStr}"\n`)
  }

  console.log(`\n📡 Importing ${TELEGRAM_SOURCES.length} channels  |  from: ${MIN_DATE.toDateString()}  |  to: now`)
  console.log('─'.repeat(60))

  let totalSaved = 0
  let totalSkipped = 0

  for (let i = 0; i < TELEGRAM_SOURCES.length; i++) {
    const source = TELEGRAM_SOURCES[i]
    process.stdout.write(`[${i + 1}/${TELEGRAM_SOURCES.length}] ${source.name.padEnd(26)} `)

    const { saved, skipped, errors } = await importChannel(client, source.username, source.name)
    console.log(`  ✓ ${saved} new  ${skipped} dup  ${errors > 0 ? errors + ' err' : ''}`)

    totalSaved   += saved
    totalSkipped += skipped

    // 2-second pause between channels
    if (i < TELEGRAM_SOURCES.length - 1) await sleep(2000)
  }

  console.log('─'.repeat(60))
  console.log(`✅ Done — ${totalSaved} new messages imported, ${totalSkipped} duplicates skipped`)
  console.log('👉 Run: npm run process   (to classify the imported articles)')

  await prisma.updateLog.create({
    data: {
      change:   `Telegram import: ${totalSaved} messages from ${TELEGRAM_SOURCES.length} channels`,
      reason:   'npm run telegram:import',
      source:   'Telegram MTProto API',
      metadata: { totalSaved, totalSkipped, channels: TELEGRAM_SOURCES.length },
    },
  })

  await client.disconnect()
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
