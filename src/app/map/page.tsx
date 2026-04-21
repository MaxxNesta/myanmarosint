export const dynamic = 'force-dynamic'

import type { ProcessedEventDTO, RiskScoreDTO } from '@/lib/types'
import MapShell from '@/components/map/MapShell'

const BASE = process.env.NEXT_PUBLIC_APP_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

async function getEvents(): Promise<ProcessedEventDTO[]> {
  try {
    const res = await fetch(`${BASE}/api/events?limit=500`, {
      next: { revalidate: 3600 },
    })
<<<<<<< HEAD
    if (!res.ok) {
      console.error('[map] GET /api/events failed:', res.status, await res.text())
      return []
    }
    const data = await res.json()
    return data.events ?? []
  } catch (err) {
    console.error('[map] GET /api/events threw:', err)
=======
    if (!res.ok) return []
    const data = await res.json()
    return data.events ?? []
  } catch {
>>>>>>> 09b2b01ac2f052933cfb7e42cd731c579678812a
    return []
  }
}

async function getRiskScores(): Promise<RiskScoreDTO[]> {
  try {
    const res = await fetch(`${BASE}/api/risk`, {
      next: { revalidate: 3600 },
    })
<<<<<<< HEAD
    if (!res.ok) {
      console.error('[map] GET /api/risk failed:', res.status, await res.text())
      return []
    }
    const data = await res.json()
    return data.scores ?? []
  } catch (err) {
    console.error('[map] GET /api/risk threw:', err)
=======
    if (!res.ok) return []
    const data = await res.json()
    return data.scores ?? []
  } catch {
>>>>>>> 09b2b01ac2f052933cfb7e42cd731c579678812a
    return []
  }
}

export const metadata = {
  title: 'Conflict Map — Myanmar Risk Platform',
}

export default async function MapPage() {
  const [events, riskScores] = await Promise.all([getEvents(), getRiskScores()])

  return <MapShell initialEvents={events} initialRiskScores={riskScores} />
}
