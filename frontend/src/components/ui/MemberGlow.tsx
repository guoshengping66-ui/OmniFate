"use client"

interface MemberGlowProps {
  isPremium?: boolean
  isFounder?: boolean
  children: React.ReactNode
}

export function MemberGlow({ isPremium, isFounder, children }: MemberGlowProps) {
  if (!isPremium && !isFounder) {
    return <>{children}</>
  }

  return (
    <div className="relative inline-block">
      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-full animate-pulse ${
          isFounder
            ? "bg-gradient-to-r from-yellow-500/30 via-amber-500/40 to-yellow-500/30 blur-md"
            : "bg-gradient-to-r from-gold/20 via-gold/30 to-gold/20 blur-sm"
        }`}
        style={{
          animation: "member-glow 3s ease-in-out infinite",
        }}
      />

      {/* Founder: extra particle ring */}
      {isFounder && (
        <div className="absolute inset-[-8px] rounded-full border border-gold/20 animate-spin"
          style={{ animationDuration: "8s" }}
        >
          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-gold rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-gold/60 rounded-full -translate-x-1/2 translate-y-1/2" />
          <div className="absolute left-0 top-1/2 w-1 h-1 bg-gold/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
