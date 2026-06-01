import prisma from './db'

export interface RateLimitResult {
  allowed:   boolean
  remaining: number
  resetAt:   Date
}

/**
 * IP-based rate limiter backed by Neon DB.
 * Uses a sliding hourly window — cheap, no extra services required.
 *
 * @param ip        Client IP address
 * @param endpoint  Short identifier e.g. 'analyze-area'
 * @param limit     Max requests per hour (default 10)
 */
export async function checkRateLimit(
  ip:       string,
  endpoint: string,
  limit     = 10,
): Promise<RateLimitResult> {
  const now        = new Date()
  const windowHour = Math.floor(now.getTime() / (60 * 60 * 1000))
  const key        = `${ip}:${endpoint}:${windowHour}`
  const expiresAt  = new Date((windowHour + 1) * 60 * 60 * 1000)

  try {
    // Upsert: create with hits=1 or increment if already exists
    const record = await prisma.$transaction(async (tx) => {
      const existing = await tx.rateLimit.findUnique({ where: { key } })
      if (existing) {
        return tx.rateLimit.update({
          where: { key },
          data:  { hits: { increment: 1 } },
        })
      }
      return tx.rateLimit.create({
        data: { key, hits: 1, expiresAt },
      })
    })

    const remaining = Math.max(0, limit - record.hits)
    return { allowed: record.hits <= limit, remaining, resetAt: expiresAt }
  } catch {
    // On DB error, allow the request (fail open)
    return { allowed: true, remaining: limit, resetAt: expiresAt }
  }
}

/**
 * Purge expired rate limit records. Call from cron to keep table small.
 */
export async function purgeExpiredRateLimits() {
  return prisma.rateLimit.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
}
