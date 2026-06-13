"use client"

export default function AnalysisLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="h-8 bg-white/5 rounded w-1/2 mx-auto animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-2/3 mx-auto animate-pulse" />
        </div>
        <div className="card-glass p-8 flex justify-center">
          <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      </div>
    </div>
  )
}
