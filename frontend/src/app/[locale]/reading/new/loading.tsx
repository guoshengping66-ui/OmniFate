"use client"

export default function NewReadingLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full w-1/4 bg-gold/30 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <div className="h-8 bg-white/5 rounded w-1/3 mx-auto animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-1/2 mx-auto animate-pulse" />
        </div>
        <div className="card-glass p-6 md:p-8 space-y-4">
          <div className="h-6 bg-white/5 rounded w-1/4 animate-pulse" />
          <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
