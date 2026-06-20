/**
 * App-level loading skeleton. Shown while a server component streams its data,
 * so navigation feels instant instead of blocking on a blank screen.
 */
export default function Loading() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1.5 rounded-full bg-gold/40" />
        <div className="h-9 w-64 animate-pulse rounded-lg bg-white/5" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-[24px] border border-white/5 bg-white/[0.03]"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-[24px] border border-white/5 bg-white/[0.03]"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
