import { TelegramClient } from 'telegram'
import { StringSession }  from 'telegram/sessions'
import { Api }            from 'telegram'
import { TELEGRAM_SOURCES } from '../lib/rss'

const API_ID   = Number(process.env.TELEGRAM_API_ID)
const API_HASH = process.env.TELEGRAM_API_HASH ?? ''
const SESSION  = process.env.TELEGRAM_SESSION  ?? ''

async function main() {
  const client = new TelegramClient(new StringSession(SESSION), API_ID, API_HASH, { connectionRetries: 3 })
  await client.connect()

  console.log('\n' + 'Channel'.padEnd(28) + 'Username'.padEnd(22) + 'From Feb 2021')
  console.log('-'.repeat(65))

  const FEB_2021 = Math.floor(new Date('2021-02-01').getTime() / 1000)

  for (const src of TELEGRAM_SOURCES) {
    try {
      const entity = await client.getEntity(src.username)

      // Step 1: find the first message ID at/after Feb 2021
      const r1 = await client.invoke(new Api.messages.GetHistory({
        peer:       entity,
        limit:      1,
        offsetId:   0,
        offsetDate: FEB_2021,
        addOffset:  -1,   // get the message just at that date
        maxId:      0,
        minId:      0,
        hash:       BigInt(0),
      }))
      const firstMsg    = (r1 as any).messages?.[0]
      const feb2021Id   = firstMsg?.id ?? 0

      // Step 2: count messages from that ID onwards (minId filter)
      const r2 = await client.invoke(new Api.messages.GetHistory({
        peer:       entity,
        limit:      1,
        offsetId:   0,
        offsetDate: 0,
        addOffset:  0,
        maxId:      0,
        minId:      feb2021Id > 0 ? feb2021Id - 1 : 0,
        hash:       BigInt(0),
      }))
      const fromFeb2021 = (r2 as any).count ?? '?'
      const total       = (r1 as any).count ?? '?'

      console.log(
        src.name.padEnd(28) +
        src.username.padEnd(22) +
        String(fromFeb2021).padStart(10) +
        `  (total: ${total})`
      )
    } catch (err) {
      console.log(src.name.padEnd(28) + src.username.padEnd(22) + `error: ${String(err).slice(0, 40)}`)
    }
  }

  await client.disconnect()
}

main().catch(console.error)
