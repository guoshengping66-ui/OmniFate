"use client"

export default function ReadingsLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 bg-white/5 rounded-lg w-1/3 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-glass p-5 flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-white/5 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
