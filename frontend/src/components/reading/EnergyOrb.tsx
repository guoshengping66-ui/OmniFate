"use client"

import { useRef, useMemo, Suspense, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

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

  const color = useMemo(() => {
    return PHASE_COLORS[phase] || PHASE_COLORS.init
  }, [phase])

  // Geometry detail increases with progress
  const detail = useMemo(() => {
    if (progressPct < 20) return 0  // icosahedron
    if (progressPct < 60) return 1
    return 2
  }, [progressPct])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3
      meshRef.current.rotation.x += delta * 0.15
      // Gentle scale pulse
      const scale = 1 + Math.sin(Date.now() * 0.002) * 0.05
      meshRef.current.scale.setScalar(scale)
    }
    if (wireRef.current) {
      wireRef.current.rotation.y -= delta * 0.5
      wireRef.current.rotation.z += delta * 0.2
    }
  })

  const emissiveIntensity = useMemo(() => {
    if (phase === "done") return 1.2
    if (phase === "master") return 0.8
    return 0.4 + (progressPct / 100) * 0.4
  }, [phase, progressPct])

  return (
    <group>
      {/* Solid core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, detail]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
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

  const particleSize = useMemo(() => {
    return 0.02 + (progressPct / 100) * 0.03
  }, [progressPct])

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={particleSize}
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

  const color = useMemo(() => {
    return PHASE_COLORS[phase] || PHASE_COLORS.init
  }, [phase])

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8
      ringRef.current.rotation.x += delta * 0.3
    }
  })

  const opacity = useMemo(() => {
    if (phase === "done") return 0.5
    return 0.15 + (progressPct / 100) * 0.2
  }, [phase, progressPct])

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[1.8, 0.02, 16, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
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
export default function EnergyOrb(props: EnergyOrbProps) {
  return (
    <div className="w-full aspect-square max-w-[320px] mx-auto">
      <Suspense fallback={<OrbFallback />}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <Scene {...props} />
        </Canvas>
      </Suspense>
    </div>
  )
}
