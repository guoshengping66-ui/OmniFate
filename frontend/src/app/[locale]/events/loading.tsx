"use client"

export default function EventsLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-white/[0.04] rounded w-1/4 animate-pulse" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card-solid p-5 space-y-3 animate-pulse">
              <div className="h-5 bg-white/[0.04] rounded w-2/3" />
              <div className="h-4 bg-white/[0.04] rounded w-1/2" />
              <div className="h-3 bg-white/[0.04] rounded w-full" />
              <div className="h-8 bg-gold/10 rounded-lg w-1/3 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
