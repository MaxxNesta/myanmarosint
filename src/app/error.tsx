'use client'

import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-surface-0 text-slate-300">
      <div className="text-center space-y-3">
        <div className="text-xs font-mono font-bold tracking-widest text-red-400">
          SYSTEM ERROR
        </div>
        <h2 className="text-lg font-bold text-slate-100">Something went wrong</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          {error.message ?? 'An unexpected error occurred in the intelligence platform.'}
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-slate-600">digest: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="px-5 py-2 text-sm font-semibold rounded bg-accent-blue hover:bg-accent-blue-light text-white transition-colors"
      >
        Retry
      </button>
    </div>
  )
}
