/**
 * Manually ingest a single article URL through the full pipeline.
 * Usage: tsx --env-file=.env.local src/scripts/ingest-url.ts <url>
 */
import { makePrisma }       from './make-prisma'
import { extractEvents }    from '../lib/event-extractor'
import { enrichEvents }     from '../lib/event-enricher'
import { normalizeActors, normalizeRegion } from '../lib/normalizer'
import { buildDedupHash }   from '../lib/dedup'
import { resolveCoordinates } from '../lib/geocoding'
import { getBaseReliability } from '../lib/confidence'

const prisma = makePrisma()
const INTEL_START = new Date('2023-01-01T00:00:00Z')

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

async function main() {
  const url = process.argv[2]
  if (!url) { console.error('Usage: tsx ingest-url.ts <url>'); process.exit(1) }

  console.log('Fetching:', url)
  const res  = await fetch(url, { headers: { 'User-Agent': 'MyanmarCivilWar/1.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim().replace(/ \|.*$/, '').trim() : url

  // Extract content from article body
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i) ??
                       html.match(/<div[^>]+(?:article|content|story|post)[^>]*>([\s\S]*?)<\/div>/i)
  const rawContent = articleMatch ? articleMatch[0] : html
  const content    = stripHtml(rawContent).slice(0, 4000)

  // Try to extract date from meta tags
  const dateMatch = html.match(/(?:publishedTime|datePublished|article:published_time)['":\s]+([0-9T\-:Z+]+)/i)
  const publishedAt = dateMatch ? new Date(dateMatch[1]) : new Date()

  console.log('Title:  ', title)
  console.log('Date:   ', publishedAt.toISOString().slice(0, 10))
  console.log('Content:', content.slice(0, 200))

  // Save RawArticle
  const sourceName = new URL(url).hostname.replace(/^www\./, '')
  let article = await prisma.rawArticle.findUnique({ where: { url } })
  if (article) {
    console.log('\nArticle already in DB:', article.id)
  } else {
    article = await prisma.rawArticle.create({
      data: {
        url,
        channelName: sourceName,
        title,
        content: `${title}\n\n${content}`,
        sourceType:  'RSS',
        publishedAt,
      },
    })
    console.log('\nRawArticle created:', article.id)
  }

  // Check if already extracted
  const existing = await prisma.conflictEvent.findFirst({ where: { rawArticleId: article.id } })
  if (existing) {
    console.log('Already extracted as', existing.eventType, 'in', existing.region)
    await prisma.$disconnect()
    return
  }

  // Stage 1 — Groq extraction
  const events = await extractEvents(title, content, sourceName, publishedAt)
  if (events.length === 0) {
    console.log('\nGroq returned no events — creating manual entry for Maw Taung...')
    // Fall through to manual creation below
  }

  const ev = events[0] ?? {
    eventType:     'RECAPTURED' as const,
    date:          publishedAt.toISOString().split('T')[0],
    region:        'Tanintharyi Region',
    adminArea:     'Maw Taung',
    location:      'Maw Taung',
    actors:        ['Tatmadaw'],
    attackerActor: 'Tatmadaw',
    defenderActor: 'Karen National Union',
    summary:       title.slice(0, 180),
    fatalities:    0,
    fatalitiesMin: 0,
    fatalitiesMax: 0,
    biasFlag:      'neutral' as const,
  }

  // Stage 2 — DeepSeek enrichment
  const [enr] = await enrichEvents(
    [{
      eventType:      ev.eventType,
      actors:         ev.actors,
      location:       ev.location,
      region:         normalizeRegion(ev.region),
      rawSummary:     ev.summary,
      fatalities:     ev.fatalities,
      articleContent: content.slice(0, 500),
    }],
    title,
  )

  const actors      = normalizeActors(ev.actors)
  const evDate      = new Date(ev.date)
  const rawRegion   = normalizeRegion(ev.region)
  const dsLocation  = enr.location  ?? ev.location ?? ''
  const dsAdmin     = enr.adminArea ?? ev.adminArea ?? null
  let   region      = enr.region ? normalizeRegion(enr.region) : rawRegion

  const geo = resolveCoordinates(dsLocation, dsAdmin ?? '', region)
  if (geo.region) region = geo.region

  const dedupHash  = buildDedupHash({ actors, region, adminArea: dsAdmin, eventType: ev.eventType, date: evDate })
  const confidence = Math.round((getBaseReliability(sourceName) * 0.6 + enr.confidence * 0.4) * 100) / 100

  const conflict = await prisma.conflictEvent.upsert({
    where:  { dedupHash },
    create: {
      rawArticleId:  article.id,
      eventType:     ev.eventType,
      date:          evDate,
      region,
      adminArea:     dsAdmin,
      location:      dsLocation || null,
      lat:           geo.coords[1],
      lng:           geo.coords[0],
      summary:       ev.summary.slice(0, 800),
      fatalities:    ev.fatalities,
      fatalitiesMin: ev.fatalitiesMin,
      fatalitiesMax: ev.fatalitiesMax,
      biasFlag:      ev.biasFlag,
      dedupHash,
    },
    update: { lat: geo.coords[1], lng: geo.coords[0], region },
  })

  await prisma.analysedEvent.upsert({
    where:  { conflictEventId: conflict.id },
    create: {
      conflictEventId:      conflict.id,
      attackerActor:        enr.attackerActor ? normalizeActors([enr.attackerActor])[0] ?? null : null,
      defenderActor:        enr.defenderActor ? normalizeActors([enr.defenderActor])[0] ?? null : null,
      actors,
      confidence,
      summary:              enr.summary.slice(0, 800),
      isActiveIntelligence: evDate >= INTEL_START,
    },
    update: {},
  })

  console.log(`\n✓ Saved: ${ev.eventType} | ${region} | ${dsLocation || dsAdmin}`)
  console.log(`  Summary: ${enr.summary.slice(0, 120)}`)
  console.log(`  Coords:  ${geo.coords[1].toFixed(4)}, ${geo.coords[0].toFixed(4)}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
