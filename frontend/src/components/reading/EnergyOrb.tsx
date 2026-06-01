"use client"

import React, { useRef, useMemo, Suspense, useEffect, useState, useCallback, Component, type ReactNode } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

// ── Error Boundary for WebGL context loss ───────────────────────────────────
interface ErrorBoundaryState { hasError: boolean }
class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error) {
    console.warn("[EnergyOrb] WebGL error caught:", error.message)
  }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

type AgentStatusValue = "pending" | "running" | "done" | "error" | "skipped"

interface EnergyOrbProps {
  progressPct: number
  agentStatus: Record<string, AgentStatusValue>
  phase: string
  completedCount: number
  totalAgents: number
}

// ── Color palette per phase ────────────────────────────────────────────────
const PHASE_COLORS: Record<string, THREE.Color> = {
  init:     new THREE.Color("#C9A84C"),  // gold
  parallel: new THREE.Color("#8B5CF6"),  // purple
  master:   new THREE.Color("#F59E0B"),  // amber
  done:     new THREE.Color("#22C55E"),  // green
}

const AGENT_COLORS: Record<string, THREE.Color> = {
  bazi:      new THREE.Color("#C9A84C"),
  astrology: new THREE.Color("#A78BFA"),
  tarot:     new THREE.Color("#34D399"),
  qimen:     new THREE.Color("#F59E0B"),
  ziwei:     new THREE.Color("#C084FC"),
  face:      new THREE.Color("#FB7185"),
  palm:      new THREE.Color("#FBBF24"),
}

// ── Core Orb ──────────────────────────────────────────────────────────────
function CoreOrb({ progressPct, phase }: { progressPct: number; phase: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.Mesh>(null)
  // Internal smoothed value — avoids React state updates for animation
  const smoothPctRef = useRef(0)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)

  const color = useMemo(() => {
    return PHASE_COLORS[phase] || PHASE_COLORS.init
  }, [phase])

  // Throttled geometry detail — only changes at wider thresholds to avoid
  // heavy geometry recreation that can trigger WebGL context loss
  const detailRef = useRef(0)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3
      meshRef.current.rotation.x += delta * 0.15
      const scale = 1 + Math.sin(Date.now() * 0.002) * 0.05
      meshRef.current.scale.setScalar(scale)
    }
    if (wireRef.current) {
      wireRef.current.rotation.y -= delta * 0.5
      wireRef.current.rotation.z += delta * 0.2
    }
    // Smooth interpolation in useFrame (no React state updates)
    const cur = smoothPctRef.current
    const tgt = progressPct
    smoothPctRef.current = cur + (tgt - cur) * 0.08

    // Update emissive intensity directly on material (no React re-render)
    if (materialRef.current) {
      let intensity: number
      if (phase === "done") intensity = 1.2
      else if (phase === "master") intensity = 0.8
      else intensity = 0.4 + (smoothPctRef.current / 100) * 0.4
      materialRef.current.emissiveIntensity = intensity
    }

    // Throttled geometry detail change — only update when crossing wider thresholds
    const newDetail = smoothPctRef.current < 15 ? 0 : smoothPctRef.current < 55 ? 1 : 2
    if (newDetail !== detailRef.current) {
      detailRef.current = newDetail
    }
  })

  const detail = detailRef.current

  return (
    <group>
      {/* Solid core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, detail]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.6}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.15, detail]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}

// ── Particle Field ────────────────────────────────────────────────────────
function ParticleField({
  progressPct,
  agentStatus,
  completedCount,
}: {
  progressPct: number
  agentStatus: Record<string, AgentStatusValue>
  completedCount: number
}) {
  const pointsRef = useRef<THREE.Points>(null)
  const agentStatusRef = useRef(agentStatus)
  useEffect(() => { agentStatusRef.current = agentStatus }, [agentStatus])

  // Generate particle positions
  const { positions, colors } = useMemo(() => {
    const count = 200
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Spherical distribution with some randomness
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 1.5 + Math.random() * 2.0

      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      // Default gold color
      col[i * 3]     = 0.79
      col[i * 3 + 1] = 0.66
      col[i * 3 + 2] = 0.30
    }

    return { positions: pos, colors: col }
  }, [])

  // Create geometry with positions and colors
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return geo
  }, [positions, colors])

  // Update colors based on completed agents
  useFrame(() => {
    if (!pointsRef.current) return
    const geo = pointsRef.current.geometry
    const colorAttr = geo.getAttribute("color") as THREE.BufferAttribute
    if (!colorAttr) return

    const arr = colorAttr.array as Float32Array
    const count = arr.length / 3

    // Color particles based on which agents are done
    const doneAgents = Object.entries(agentStatusRef.current)
      .filter(([, s]) => s === "done")
      .map(([id]) => id)

    for (let i = 0; i < count; i++) {
      if (doneAgents.length === 0) {
        // All gold during init
        arr[i * 3]     = 0.79
        arr[i * 3 + 1] = 0.66
        arr[i * 3 + 2] = 0.30
      } else {
        // Pick a random done agent's color for this particle
        const agentId = doneAgents[i % doneAgents.length]
        const c = AGENT_COLORS[agentId] || PHASE_COLORS.init
        arr[i * 3]     = c.r
        arr[i * 3 + 1] = c.g
        arr[i * 3 + 2] = c.b
      }
    }
    colorAttr.needsUpdate = true

    // Rotate particle field
    pointsRef.current.rotation.y += 0.003
    pointsRef.current.rotation.x += 0.001
  })

  // Smooth particle size via ref (no React state)
  const particleSizeRef = useRef(0.02)

  useFrame(() => {
    // Smooth interpolation of particle size
    const targetSize = 0.02 + (progressPct / 100) * 0.03
    particleSizeRef.current += (targetSize - particleSizeRef.current) * 0.05
    // Update material size directly if available
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial
      if (mat) mat.size = particleSizeRef.current
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  )
}

// ── Glow Ring ─────────────────────────────────────────────────────────────
function GlowRing({ progressPct, phase }: { progressPct: number; phase: string }) {
  const ringRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  const color = useMemo(() => {
    return PHASE_COLORS[phase] || PHASE_COLORS.init
  }, [phase])

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8
      ringRef.current.rotation.x += delta * 0.3
    }
    // Smooth opacity update via ref (no React state)
    if (materialRef.current) {
      const targetOpacity = phase === "done" ? 0.5 : 0.15 + (progressPct / 100) * 0.2
      materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * 0.1
    }
  })

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[1.8, 0.02, 16, 64]} />
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0.15}
      />
    </mesh>
  )
}

// ── Scene ─────────────────────────────────────────────────────────────────
function Scene(props: EnergyOrbProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#C9A84C" />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#8B5CF6" />

      <CoreOrb progressPct={props.progressPct} phase={props.phase} />
      <ParticleField
        progressPct={props.progressPct}
        agentStatus={props.agentStatus}
        completedCount={props.completedCount}
      />
      <GlowRing progressPct={props.progressPct} phase={props.phase} />
      {props.phase === "master" && <GlowRing progressPct={props.progressPct} phase={props.phase} />}
    </>
  )
}

// ── Loading fallback ──────────────────────────────────────────────────────
function OrbFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-24 h-24 rounded-full bg-gold/20 animate-pulse" />
    </div>
  )
}

// ── Main Export ────────────────────────────────────────────────────────────
const MemoizedEnergyOrb = React.memo(function EnergyOrb(props: EnergyOrbProps) {
  const [contextLost, setContextLost] = useState(false)
  const lastContextLostRef = useRef(0)

  const handleContextLost = useCallback((e: Event) => {
    e.preventDefault()
    const now = Date.now()
    // Cooldown: don't process context loss more than once per 3 seconds
    // Prevents rapid cycling that can cause React error #310
    if (now - lastContextLostRef.current < 3000) return
    lastContextLostRef.current = now
    setContextLost(true)
  }, [])

  const handleContextRestored = useCallback(() => {
    // Only restore if we actually lost context
    setContextLost(false)
  }, [])

  return (
    <div className="w-full aspect-square max-w-[320px] mx-auto">
      <WebGLErrorBoundary fallback={<OrbFallback />}>
        {contextLost ? (
          <OrbFallback />
        ) : (
          <Suspense fallback={<OrbFallback />}>
            <Canvas
              camera={{ position: [0, 0, 4], fov: 45 }}
              dpr={[1, 1.25]}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "default",
                failIfMajorPerformanceCaveat: false,
              }}
              style={{ background: "transparent" }}
              onCreated={({ gl }) => {
                const canvas = gl.domElement
                canvas.addEventListener("webglcontextlost", handleContextLost)
                canvas.addEventListener("webglcontextrestored", handleContextRestored)
              }}
            >
              <Scene {...props} />
            </Canvas>
          </Suspense>
        )}
      </WebGLErrorBoundary>
    </div>
  )
})

export default MemoizedEnergyOrb
