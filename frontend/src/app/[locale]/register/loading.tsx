"use client"

export default function RegisterLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="card-glass p-8 w-full max-w-md space-y-5">
        <div className="h-7 bg-white/5 rounded w-1/3 mx-auto animate-pulse" />
        <div className="space-y-3">
          <div className="h-12 bg-[#030918] rounded-xl animate-pulse" />
          <div className="h-12 bg-[#030918] rounded-xl animate-pulse" />
          <div className="h-12 bg-[#030918] rounded-xl animate-pulse" />
        </div>
        <div className="h-12 bg-gold/10 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}
