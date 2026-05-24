"use client"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="card-glass p-8 space-y-4">
          <div className="h-6 bg-white/5 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
          <div className="flex gap-4 mt-6">
            <div className="h-10 bg-white/5 rounded-full w-32 animate-pulse" />
            <div className="h-10 bg-white/5 rounded-full w-32 animate-pulse" />
          </div>
        </div>
        <div className="card-glass p-8 space-y-4">
          <div className="h-5 bg-white/5 rounded w-1/4 animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
