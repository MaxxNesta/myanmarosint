export interface RssItem {
  title:       string
  url:         string
  content:     string
  publishedAt: Date | null
  sourceName:  string
}

export interface RssSource {
  name:        string
  feedUrl:     string
  reliability: 'HIGH' | 'MEDIUM' | 'LOW'
}

export type TelegramBias = 'PRO_MILITARY' | 'PRO_DEMOCRACY' | 'NEUTRAL'

export interface TelegramSource {
  username:    string
  name:        string
  bias:        TelegramBias
  reliability: 'HIGH' | 'MEDIUM' | 'LOW'
}

// Myanmar conflict news sources — publicly available RSS feeds
export const RSS_SOURCES: RssSource[] = [
  // ── Independent / Investigative ──────────────────────────────────────────
  { name: 'The Irrawaddy',          feedUrl: 'https://www.irrawaddy.com/feed',                        reliability: 'HIGH'   },
  { name: 'Myanmar Now',            feedUrl: 'https://myanmar-now.org/en/feed/',                      reliability: 'HIGH'   },
  { name: 'Mizzima',                feedUrl: 'https://mizzima.com/feed',                              reliability: 'HIGH'   },
  { name: 'Frontier Myanmar',       feedUrl: 'https://www.frontiermyanmar.net/en/feed',               reliability: 'HIGH'   },
  { name: 'Eleven Myanmar',         feedUrl: 'https://elevenmyanmar.com/feed',                        reliability: 'MEDIUM' },
  { name: 'Myanmar Times',          feedUrl: 'https://www.mmtimes.com/feed',                          reliability: 'MEDIUM' },
  { name: 'The Myanmar Post',       feedUrl: 'https://themyanmarpost.com/feed/',                      reliability: 'MEDIUM' },

  // ── International Broadcast ───────────────────────────────────────────────
  { name: 'DVB News',               feedUrl: 'https://english.dvb.no/feed/',                          reliability: 'HIGH'   },
  { name: 'RFA Myanmar',            feedUrl: 'https://www.rfa.org/english/news/myanmar/feed',         reliability: 'HIGH'   },
  { name: 'VOA Myanmar',            feedUrl: 'https://burmese.voanews.com/api/zrqmooop_t',            reliability: 'HIGH'   },
  { name: 'BBC Burmese',            feedUrl: 'https://feeds.bbci.co.uk/burmese/rss.xml',              reliability: 'HIGH'   },

  // ── Ethnic / Regional ────────────────────────────────────────────────────
  { name: 'Narinjara News',         feedUrl: 'https://www.narinjara.com/feed',                        reliability: 'MEDIUM' },
  { name: 'Kantarawaddy Times',     feedUrl: 'https://www.kantarawaddy.com/feed',                     reliability: 'MEDIUM' },
  { name: 'Kachin News Group',      feedUrl: 'https://www.kachinnews.com/feed',                       reliability: 'MEDIUM' },
  { name: 'SHAN News',              feedUrl: 'https://www.shanstatenews.net/feed',                    reliability: 'MEDIUM' },
  { name: 'BNI Multimedia',         feedUrl: 'https://www.bnionline.net/en/feed',                     reliability: 'MEDIUM' },
  { name: 'Chin World',             feedUrl: 'https://www.chinworld.net/feed/',                       reliability: 'MEDIUM' },
  { name: 'Karen News',             feedUrl: 'https://karennews.org/feed/',                           reliability: 'MEDIUM' },
  { name: 'Salween Times',          feedUrl: 'https://salweentimes.com/feed/',                        reliability: 'MEDIUM' },

  // ── High-velocity / Social-first ─────────────────────────────────────────
  { name: 'Khit Thit Media',        feedUrl: 'https://khitthitnews.com/feed/',                        reliability: 'MEDIUM' },
  { name: 'YKT News',               feedUrl: 'https://yktnews.com/feed/',                             reliability: 'MEDIUM' },

  // ── Human Rights / Documentation ─────────────────────────────────────────
  { name: 'AAPP Burma',             feedUrl: 'https://aappb.org/feed/',                               reliability: 'HIGH'   },
  { name: 'Human Rights Watch',     feedUrl: 'https://www.hrw.org/tag/myanmar/feed',                  reliability: 'HIGH'   },
  { name: 'Amnesty International',  feedUrl: 'https://www.amnesty.org/en/tag/myanmar/feed/rss/',      reliability: 'HIGH'   },
  { name: 'UN News Myanmar',        feedUrl: 'https://news.un.org/feed/subscribe/en/news/region/asia-pacific/feed/rss.xml', reliability: 'HIGH' },
  { name: 'Crisis Group Myanmar',   feedUrl: 'https://www.crisisgroup.org/rss/myanmar',               reliability: 'HIGH'   },
]

// Telegram channels — scraped via t.me/s/ public web view.
// NOTE: t.me/s/ only exposes the ~20 most recent posts without authentication.
// For historical data back to Feb 2021, the Telegram MTProto API is required
// (api_id + api_hash from my.telegram.org + phone authentication).
export const TELEGRAM_SOURCES: TelegramSource[] = [
  // ── Pro-military (junta narrative) ───────────────────────────────────────
  { username: 'combatnews7723',    name: 'Combat News 7723',     bias: 'PRO_MILITARY',  reliability: 'LOW'    },
  { username: 'snowqueen023',      name: 'Snow Queen 023',       bias: 'PRO_MILITARY',  reliability: 'LOW'    },
  { username: 'BABANYUNT6',        name: 'Ba Ba Nyunt',          bias: 'PRO_MILITARY',  reliability: 'LOW'    },
  { username: 'hminewai',          name: 'Hmi Ne Wai',           bias: 'PRO_MILITARY',  reliability: 'LOW'    },
  { username: 'unionpoliticsnews', name: 'Union Politics News',  bias: 'PRO_MILITARY',  reliability: 'LOW'    },

  // ── Pro-democracy (resistance narrative) ─────────────────────────────────
  { username: 'khitthitnews',      name: 'Khit Thit News TG',   bias: 'PRO_DEMOCRACY', reliability: 'MEDIUM' },
  { username: 'theirrawaddy',      name: 'The Irrawaddy TG',    bias: 'PRO_DEMOCRACY', reliability: 'HIGH'   },
  { username: 'MyanmarNowNews',    name: 'Myanmar Now TG',      bias: 'PRO_DEMOCRACY', reliability: 'HIGH'   },
  { username: 'mandalayfreepress', name: 'Mandalay Free Press', bias: 'PRO_DEMOCRACY', reliability: 'MEDIUM' },

  // ── Neutral / International ───────────────────────────────────────────────
  { username: 'bbcnewsburmese',    name: 'BBC News Burmese TG', bias: 'NEUTRAL',       reliability: 'HIGH'   },
  { username: 'dvbtvnews',         name: 'DVB TV News TG',      bias: 'NEUTRAL',       reliability: 'HIGH'   },
  { username: 'VOMNEWS2023',       name: 'VOM News',            bias: 'NEUTRAL',       reliability: 'MEDIUM' },
]

// ── Shared helpers ────────────────────────────────────────────────────────────

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim()
}

function extractTag(block: string, tag: string): string {
  const cdataMatch = block.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, 'i'))
  if (cdataMatch) return cdataMatch[1].trim()
  const plainMatch = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  if (plainMatch) return decodeHtml(plainMatch[1].trim())
  return ''
}

function parseDate(str: string): Date | null {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

// ── RSS feed fetcher ──────────────────────────────────────────────────────────

export async function fetchFeed(source: RssSource): Promise<RssItem[]> {
  let xml: string
  try {
    const res = await fetch(source.feedUrl, {
      cache: 'no-store',
      headers: { 'User-Agent': 'MyanmarRiskPlatform/1.0 (+https://github.com)' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return []
    xml = await res.text()
  } catch {
    return []
  }

  const items: RssItem[] = []
  const blocks = xml.split(/<item[\s>]|<entry[\s>]/i).slice(1)

  for (const block of blocks) {
    const title = stripTags(extractTag(block, 'title'))
    const url   =
      extractTag(block, 'link') ||
      block.match(/<link[^>]+href="([^"]+)"/i)?.[1] ||
      ''

    if (!url || !title) continue

    const content =
      extractTag(block, 'content:encoded') ||
      extractTag(block, 'content')         ||
      extractTag(block, 'description')     ||
      extractTag(block, 'summary')         ||
      ''

    const pubRaw =
      extractTag(block, 'pubDate')   ||
      extractTag(block, 'published') ||
      extractTag(block, 'updated')   ||
      ''

    items.push({
      title,
      url:         url.trim(),
      content:     stripTags(content).slice(0, 4000),
      publishedAt: parseDate(pubRaw),
      sourceName:  source.name,
    })
  }

  return items
}

// ── RSS-only feed fetcher ─────────────────────────────────────────────────────
// Telegram channels are fetched separately via:  npm run telegram:import
// (uses MTProto API for full history back to 2021-02-01)

export async function fetchAllFeeds(): Promise<RssItem[]> {
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFeed))
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
}

// Set of Telegram source names — used by ingest.ts to bypass English keyword filter
export const TELEGRAM_SOURCE_NAMES = new Set(TELEGRAM_SOURCES.map(s => s.name))
