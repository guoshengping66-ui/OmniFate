"use client"

export default function DivinationLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="h-8 bg-white/5 rounded-lg w-1/3 mx-auto animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-2/3 mx-auto animate-pulse" />
        </div>
        <div className="card-glass p-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
