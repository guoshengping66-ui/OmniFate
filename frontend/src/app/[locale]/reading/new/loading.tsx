"use client"

export default function ReadingNewLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Step indicator skeleton */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-8 h-2 rounded-full bg-white/5 animate-pulse" />
          ))}
        </div>
        {/* Form skeleton */}
        <div className="card-glass p-6 space-y-5">
          <div className="h-6 bg-white/5 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-12 bg-gold/10 rounded-xl animate-pulse mt-6" />
        </div>
      </div>
    </div>
  )
}
