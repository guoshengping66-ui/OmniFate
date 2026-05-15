"use client"
import { type ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"

interface MemberGlowProps {
  children: ReactNode
  size?: "sm" | "md" | "lg"
}

export function MemberGlow({ children, size = "md" }: MemberGlowProps) {
  const { user } = useAuth()

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const isFounder = user?.is_founder
  const isPremium = user?.is_premium

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeClasses[size]}`}>
      {/* Founder: black-gold nebula glow with particles */}
      {isFounder && (
        <div className="absolute inset-0 -m-2">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold/30 via-gold/10 to-gold/30 animate-[nebula-pulse_3s_ease-in-out_infinite]" />
          <div className="absolute inset-0 rounded-full border-2 border-gold/40 animate-[member-glow_2s_ease-in-out_infinite]" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-gold rounded-full animate-[star-particle_1.5s_ease-in-out_infinite_0.2s]" />
          <div className="absolute bottom-1 left-1 w-1 h-1 bg-gold/70 rounded-full animate-[star-particle_2s_ease-in-out_infinite_0.8s]" />
          <div className="absolute top-0 left-1/3 w-1 h-1 bg-gold/50 rounded-full animate-[star-particle_1.8s_ease-in-out_infinite_0.5s]" />
        </div>
      )}

      {/* Premium: gold pulse glow */}
      {isPremium && !isFounder && (
        <div className="absolute inset-0 -m-1.5">
          <div className="absolute inset-0 rounded-full border border-gold/30 animate-[member-glow_2.5s_ease-in-out_infinite]" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-gold/5 to-transparent animate-[member-glow_2.5s_ease-in-out_infinite_0.3s]" />
        </div>
      )}

      {/* Content (avatar) */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
