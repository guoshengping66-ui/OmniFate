"use client"

export default function AccountLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 bg-white/[0.04] rounded-lg w-1/4 animate-pulse" />
        <div className="card-solid p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-white/[0.04] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
