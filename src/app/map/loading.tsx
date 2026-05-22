export default function MapLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-surface-0 z-50 gap-5">
      <img
        src="/mcw-logo.jpg"
        alt="Myanmar Civil War"
        className="w-28 h-28 object-contain animate-pulse"
      />
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-mono text-slate-400 tracking-[0.3em] uppercase">
          Loading War Map
        </span>
        <div className="w-40 h-0.5 bg-surface-2 rounded overflow-hidden">
          <div className="h-full bg-red-600 animate-[loading-bar_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  )
}
