import dynamic from 'next/dynamic'
import type { ProcessedEventDTO, RiskScoreDTO } from '@/lib/types'
import MapShell from '@/components/map/MapShell'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

async function getEvents(): Promise<ProcessedEventDTO[]> {
  try {
    const res = await fetch(`${BASE}/api/events?limit=500`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.events ?? []
  } catch {
    return []
  }
}

async function getRiskScores(): Promise<RiskScoreDTO[]> {
  try {
    const res = await fetch(`${BASE}/api/risk`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.scores ?? []
  } catch {
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
