"use client"

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 bg-white/[0.04] rounded w-1/4 animate-pulse" />
        <div className="card-solid p-6 space-y-4">
          <div className="h-5 bg-white/[0.04] rounded w-1/3 animate-pulse" />
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />
          ))}
          <div className="border-t border-white/[0.06] pt-4 mt-4 space-y-2">
            <div className="h-4 bg-white/[0.04] rounded w-1/4" />
            <div className="h-6 bg-white/[0.04] rounded w-1/3" />
          </div>
          <div className="h-12 bg-gold/10 rounded-xl animate-pulse mt-4" />
        </div>
      </div>
    </div>
  )
}
