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

// Myanmar conflict news sources — all publicly available RSS feeds
export const RSS_SOURCES: RssSource[] = [
<<<<<<< HEAD
  // Independent / Investigative
  { name: 'The Irrawaddy',          feedUrl: 'https://www.irrawaddy.com/feed',                        reliability: 'HIGH'   },
  { name: 'Myanmar Now',            feedUrl: 'https://myanmar-now.org/en/feed/',                      reliability: 'HIGH'   },
  { name: 'Mizzima',                feedUrl: 'https://mizzima.com/feed',                              reliability: 'HIGH'   },
  { name: 'Frontier Myanmar',       feedUrl: 'https://www.frontiermyanmar.net/en/feed',               reliability: 'HIGH'   },

  // International / Broadcast
  { name: 'DVB News',               feedUrl: 'https://english.dvb.no/feed/',                          reliability: 'HIGH'   },
  { name: 'RFA Myanmar',            feedUrl: 'https://www.rfa.org/english/news/myanmar/feed',         reliability: 'HIGH'   },

  // Ethnic / Regional
  { name: 'Narinjara News',         feedUrl: 'https://www.narinjara.com/feed',                        reliability: 'MEDIUM' },
  { name: 'Kantarawaddy Times',     feedUrl: 'https://www.kantarawaddy.com/feed',                     reliability: 'MEDIUM' },
  { name: 'Kachin News Group',      feedUrl: 'https://www.kachinnews.com/feed',                       reliability: 'MEDIUM' },
  { name: 'SHAN',                   feedUrl: 'https://www.shanstatenews.net/feed',                    reliability: 'MEDIUM' },
  { name: 'BNI Multimedia',         feedUrl: 'https://www.bnionline.net/en/feed',                     reliability: 'MEDIUM' },

  // High-velocity / Social-first
  { name: 'Khit Thit Media',        feedUrl: 'https://khitthitnews.com/feed/',                        reliability: 'MEDIUM' },

  // Human rights / Documentation
  { name: 'AAPP Burma',             feedUrl: 'https://aappb.org/feed/',                               reliability: 'HIGH'   },
=======
  { name: 'The Irrawaddy',  feedUrl: 'https://www.irrawaddy.com/feed',                      reliability: 'HIGH'   },
  { name: 'DVB News',       feedUrl: 'https://english.dvb.no/feed/',                         reliability: 'HIGH'   },
  { name: 'Myanmar Now',    feedUrl: 'https://myanmar-now.org/en/feed/',                     reliability: 'HIGH'   },
  { name: 'RFA Myanmar',    feedUrl: 'https://www.rfa.org/english/news/myanmar/feed',        reliability: 'HIGH'   },
  { name: 'Mizzima',        feedUrl: 'https://mizzima.com/feed',                             reliability: 'MEDIUM' },
  { name: 'AAPP Burma',     feedUrl: 'https://aappb.org/feed/',                              reliability: 'HIGH'   },
  { name: 'BNI Multimedia', feedUrl: 'https://www.bnionline.net/en/feed',                    reliability: 'MEDIUM' },
>>>>>>> 09b2b01ac2f052933cfb7e42cd731c579678812a
]

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
  // Try CDATA first
  const cdataMatch = block.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, 'i'))
  if (cdataMatch) return cdataMatch[1].trim()

  // Plain tag
  const plainMatch = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  if (plainMatch) return decodeHtml(plainMatch[1].trim())

  return ''
}

function parseDate(str: string): Date | null {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

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

  // Split on <item> or <entry> (Atom feeds)
  const blocks = xml.split(/<item[\s>]|<entry[\s>]/i).slice(1)

  for (const block of blocks) {
    const title = stripTags(extractTag(block, 'title'))
    const url   =
      extractTag(block, 'link') ||
      block.match(/<link[^>]+href="([^"]+)"/i)?.[1] ||
      ''

    if (!url || !title) continue

    // Prefer <content:encoded> → <content> → <description> → <summary>
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

export async function fetchAllFeeds(): Promise<RssItem[]> {
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFeed))
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []))
}
