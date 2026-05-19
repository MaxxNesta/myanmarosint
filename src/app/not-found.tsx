import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-surface-0 text-slate-300">
      <div className="text-center space-y-3">
        <div className="text-xs font-mono font-bold tracking-widest text-slate-600">404 — NOT FOUND</div>
        <h1 className="text-xl font-bold text-slate-100">Page not found</h1>
        <p className="text-sm text-slate-500">This route does not exist in the intelligence platform.</p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/map"
          className="px-4 py-2 text-sm font-semibold rounded bg-accent-blue hover:bg-accent-blue-light text-white transition-colors"
        >
          → Conflict Map
        </Link>
        <Link
          href="/intel"
          className="px-4 py-2 text-sm font-semibold rounded bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 transition-colors"
        >
          → Intel Dashboard
        </Link>
      </div>
    </div>
  )
}
