export const dynamic = 'force-dynamic'

import type { IntelSummaryDTO, RiskScoreDTO, ProcessedEventDTO } from '@/lib/types'
import DailyBrief from '@/components/intel/DailyBrief'
import RiskOutlook from '@/components/intel/RiskOutlook'
import ScenarioAnalysis from '@/components/intel/ScenarioAnalysis'
import EventClusters from '@/components/intel/EventClusters'
import SourceTransparency from '@/components/intel/SourceTransparency'
import ThreatconBanner from '@/components/shared/ThreatconBanner'
import { THREATCON_LABELS } from '@/lib/risk'

const BASE = process.env.NEXT_PUBLIC_APP_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

async function getIntelSummary(): Promise<IntelSummaryDTO | null> {
  try {
    const res = await fetch(`${BASE}/api/intel-summary`, { next: { revalidate: 1800 } })
<<<<<<< HEAD
    if (!res.ok) {
      console.error('[intel] GET /api/intel-summary failed:', res.status, await res.text())
      return null
    }
    return res.json()
  } catch (err) {
    console.error('[intel] GET /api/intel-summary threw:', err)
=======
    if (!res.ok) return null
    return res.json()
  } catch {
>>>>>>> 09b2b01ac2f052933cfb7e42cd731c579678812a
    return null
  }
}

async function getRiskScores(): Promise<RiskScoreDTO[]> {
  try {
    const res = await fetch(`${BASE}/api/risk?days=30`, { next: { revalidate: 3600 } })
<<<<<<< HEAD
    if (!res.ok) {
      console.error('[intel] GET /api/risk failed:', res.status, await res.text())
      return []
    }
    const d = await res.json()
    return d.scores ?? []
  } catch (err) {
    console.error('[intel] GET /api/risk threw:', err)
=======
    if (!res.ok) return []
    const d = await res.json()
    return d.scores ?? []
  } catch {
>>>>>>> 09b2b01ac2f052933cfb7e42cd731c579678812a
    return []
  }
}

async function getRecentEvents(): Promise<ProcessedEventDTO[]> {
  try {
    const res = await fetch(`${BASE}/api/events?limit=200&days=30`, { next: { revalidate: 3600 } })
<<<<<<< HEAD
    if (!res.ok) {
      console.error('[intel] GET /api/events failed:', res.status, await res.text())
      return []
    }
    const d = await res.json()
    return d.events ?? []
  } catch (err) {
    console.error('[intel] GET /api/events threw:', err)
=======
    if (!res.ok) return []
    const d = await res.json()
    return d.events ?? []
  } catch {
>>>>>>> 09b2b01ac2f052933cfb7e42cd731c579678812a
    return []
  }
}

export const metadata = {
  title: 'Intel Dashboard — Myanmar Risk Platform',
}

export default async function IntelPage() {
  const [summary, scores, events] = await Promise.all([
    getIntelSummary(),
    getRiskScores(),
    getRecentEvents(),
  ])

  const threatcon = summary?.threatcon ?? 3
  const threatconLabel = THREATCON_LABELS[threatcon]

  return (
    <div className="min-h-screen bg-surface-0">
      <ThreatconBanner level={threatcon} label={threatconLabel} />

      <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
        {/* Row 1 — Brief + Risk outlook */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-2">
            <DailyBrief summary={summary} />
          </div>
          <div className="xl:col-span-3">
            <RiskOutlook scores={scores} />
          </div>
        </div>

        {/* Row 2 — Scenario + Clusters */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ScenarioAnalysis />
          <EventClusters events={events} />
        </div>

        {/* Row 3 — Source Transparency */}
        <SourceTransparency />
      </div>
    </div>
  )
}
