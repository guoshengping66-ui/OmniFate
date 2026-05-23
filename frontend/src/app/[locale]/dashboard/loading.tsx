"use client"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 bg-white/5 rounded-lg w-1/4 animate-pulse" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-glass p-5 h-32 bg-white/[0.02] animate-pulse" />
          ))}
        </div>
        <div className="card-glass p-6 space-y-4">
          <div className="h-5 bg-white/5 rounded w-1/4 animate-pulse" />
          <div className="h-40 bg-white/[0.03] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
