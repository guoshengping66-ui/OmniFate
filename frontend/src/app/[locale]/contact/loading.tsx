"use client"

export default function ContactLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 bg-white/5 rounded w-1/4 animate-pulse" />
        <div className="card-glass p-6 space-y-4">
          <div className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />
          <div className="h-24 bg-white/[0.03] rounded-xl animate-pulse" />
          <div className="h-12 bg-gold/10 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
