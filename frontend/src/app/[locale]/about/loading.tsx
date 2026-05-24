"use client"

export default function AboutLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="h-8 bg-white/5 rounded w-1/3 mx-auto animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-1/2 mx-auto animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-glass p-6 space-y-3">
              <div className="h-5 bg-white/5 rounded w-1/4 animate-pulse" />
              <div className="h-3 bg-white/5 rounded animate-pulse" />
              <div className="h-3 bg-white/5 rounded w-5/6 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
