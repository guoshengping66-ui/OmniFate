"use client"
import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

function OrbCore() {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.PointLight>(null)

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#C5A880",
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9,
        thickness: 1.5,
        ior: 1.5,
        envMapIntensity: 1.0,
        transparent: true,
        opacity: 0.85,
      }),
    []
  )

  const wireMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#C5A880",
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      }),
    []
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15
      meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.2
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = -t * 0.1
      wireRef.current.rotation.z = t * 0.08
    }
    if (glowRef.current) {
      glowRef.current.intensity = 1.5 + Math.sin(t * 0.8) * 0.5
    }
  })

  return (
    <group>
      {/* Core sphere */}
      <mesh ref={meshRef} material={glassMaterial}>
        <icosahedronGeometry args={[1.2, 4]} />
      </mesh>
      {/* Wireframe overlay */}
      <mesh ref={wireRef} material={wireMaterial} scale={1.05}>
        <icosahedronGeometry args={[1.2, 2]} />
      </mesh>
      {/* Inner glow */}
      <pointLight ref={glowRef} color="#C5A880" intensity={1.5} distance={5} />
      {/* Ambient */}
      <ambientLight intensity={0.2} />
    </group>
  )
}

function ParticleField() {
  const count = 200
  const meshRef = useRef<THREE.Points>(null)

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15
      sz[i] = Math.random() * 0.03 + 0.01
    }
    return [pos, sz]
  }, [])

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
          attribute float aSize;
          uniform float uTime;
          varying float vAlpha;
          void main() {
            vec3 pos = position;
            pos.y += sin(uTime * 0.3 + position.x * 0.5) * 0.3;
            pos.x += cos(uTime * 0.2 + position.z * 0.5) * 0.2;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * 300.0 / -mvPosition.z;
            gl_Position = projectionMatrix * mvPosition;
            vAlpha = 0.3 + 0.7 * sin(uTime + position.x + position.y);
          }
        `,
        fragmentShader: `
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float alpha = smoothstep(0.5, 0.0, d) * vAlpha * 0.6;
            gl_FragColor = vec4(0.77, 0.66, 0.5, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
      }),
    []
  )

  useFrame(({ clock }) => {
    shaderMaterial.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <points ref={meshRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={sizes}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  )
}

export default function FateOrb() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <OrbCore />
        <ParticleField />
      </Canvas>
    </div>
  )
}
