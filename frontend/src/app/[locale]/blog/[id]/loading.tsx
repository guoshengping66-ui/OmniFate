"use client"

export default function BlogDetailLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-4 bg-white/5 rounded w-1/4 animate-pulse" />
        <div className="h-8 bg-white/5 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
        <div className="space-y-3 mt-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-3 bg-white/5 rounded animate-pulse" style={{ width: `${90 - i * 10}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
