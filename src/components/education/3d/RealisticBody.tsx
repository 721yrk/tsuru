'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Cylinder, Sphere, Extrude, Tube } from '@react-three/drei'
import * as THREE from 'three'

interface RealisticBodyProps {
    simulationStep: number
}

// --- Procedural Texture Generation (Scan-like Noise) ---
const createBoneTexture = () => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Base color (Bone white/beige)
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, 512, 512)

    // Add organic noise (simulate pores and calcium structure)
    // Layer 1: Fine grain
    for (let i = 0; i < 50000; i++) {
        const x = Math.random() * 512
        const y = Math.random() * 512
        ctx.fillStyle = Math.random() < 0.5 ? '#e5e7eb' : '#f9fafb' // Subtle shifting
        ctx.fillRect(x, y, 2, 2)
    }
    // Layer 2: Larger weathering (darker spots)
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * 512
        const y = Math.random() * 512
        const size = Math.random() * 4 + 1
        ctx.fillStyle = '#d1d5db' // Darker grey
        ctx.globalAlpha = 0.3
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
    return texture
}

// --- Geometries ---

// Complex Spine Vertex Shape
// Using a custom shape that looks more like a lumbar vertebra from top view
const createVertebraShape = () => {
    const shape = new THREE.Shape()
    // Body (kidney shape approx)
    shape.moveTo(-0.06, 0)
    shape.bezierCurveTo(-0.06, 0.04, 0.06, 0.04, 0.06, 0)
    shape.bezierCurveTo(0.06, -0.04, -0.06, -0.04, -0.06, 0)
    return shape
}

// Pelvis Wing Shape (Refined)
const createPelvisWingShape = () => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    // Deep sciatic notch
    shape.bezierCurveTo(0.15, 0.05, 0.25, 0.2, 0.22, 0.5)
    // Iliac crest (top) - uneven
    shape.bezierCurveTo(0.15, 0.55, 0, 0.52, -0.12, 0.45)
    // Anterior border
    shape.bezierCurveTo(-0.1, 0.3, -0.05, 0.1, 0, 0)
    return shape
}

// Femur curve
const createFemurCurve = (side: 'left' | 'right') => {
    const dir = side === 'right' ? 1 : -1
    return new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(dir * 0.02, -0.2, 0.01),
        new THREE.Vector3(dir * 0.01, -0.5, 0.02), // Anterior bow
        new THREE.Vector3(0, -0.85, 0)
    ])
}

// --- Components ---

function BoneMesh({ geometry, materialProps = {}, position, rotation, scale }: any) {
    // Generate texture once (lazy simulation of 'useLoader')
    const texture = useMemo(() => createBoneTexture(), [])

    const material = useMemo(() => {
        const mat = new THREE.MeshStandardMaterial({
            map: texture,
            bumpMap: texture,
            bumpScale: 0.02,
            roughness: 0.6,
            roughnessMap: texture, // map rough parts to noise
            metalness: 0.1,
            color: '#ffffff', // Texture provides color
            ...materialProps
        })
        return mat
    }, [texture, materialProps])

    return (
        <mesh
            geometry={geometry}
            material={material}
            position={position}
            rotation={rotation}
            scale={scale}
            castShadow
            receiveShadow
        />
    )
}

function VertebraComplex({ position, rotation, isRisk }: { position: [number, number, number], rotation?: [number, number, number], isRisk?: boolean }) {
    const bodyShape = useMemo(() => createVertebraShape(), [])
    const extrudeSettings = useMemo(() => ({ depth: 0.06, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 0.005, bevelThickness: 0.005 }), [])

    return (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : new THREE.Euler()}>
            {/* Vertebral Body */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <BoneMesh geometry={new THREE.ExtrudeGeometry(bodyShape, extrudeSettings)}
                    materialProps={isRisk ? { color: '#fbbf24', emissive: '#d97706', emissiveIntensity: 0.2 } : {}}
                    position={[0, 0, -0.03]} // Center it
                />
            </group>

            {/* Posterior Elements (Arch, Spinous Process) - The intricate part */}
            <group position={[0, 0, 0.06]}>
                {/* Lamina / Arch */}
                <BoneMesh position={[0, 0, 0]}
                    geometry={new THREE.TorusGeometry(0.045, 0.015, 8, 16, 3.5)} // Arch
                    rotation={[0, 0, 3.9]}
                    materialProps={isRisk ? { color: '#fbbf24' } : {}}
                />
                {/* Spinous Process */}
                <BoneMesh position={[0, -0.01, 0.06]}
                    rotation={[-0.2, 0, 0]}
                    geometry={new THREE.BoxGeometry(0.015, 0.05, 0.05)}
                    // Rounding it visually with bevels would be better, but small box is ok with bump map
                    materialProps={isRisk ? { color: '#fbbf24' } : {}}
                />
                {/* Transverse Processes */}
                <BoneMesh position={[0.06, 0, -0.02]} rotation={[0, 0, -0.2]} geometry={new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8)} rotationZ={1.57} />
                <BoneMesh position={[-0.06, 0, -0.02]} rotation={[0, 0, 0.2]} geometry={new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8)} rotationZ={-1.57} />
            </group>

            {/* Disk */}
            <BoneMesh position={[0, 0.05, 0]} rotation={[1.57, 0, 0]}
                geometry={new THREE.CylinderGeometry(0.06, 0.06, 0.015, 16)}
                materialProps={{ color: '#cbd5e1', roughness: 0.8, bumpScale: 0.05 }}
            />
        </group>
    )
}

function PelvisComplex() {
    const wingShape = useMemo(() => createPelvisWingShape(), [])
    const extrudeSettings = useMemo(() => ({ depth: 0.04, bevelEnabled: true, bevelSegments: 4, steps: 4, bevelSize: 0.01, bevelThickness: 0.01 }), [])

    return (
        <group>
            {/* Sacrum: Triangular Wedge with Holes */}
            <BoneMesh position={[0, 0, -0.1]} rotation={[3.14, 0, 0]}
                geometry={new THREE.ConeGeometry(0.09, 0.16, 6)} // Hexagonal cone looks more organic than cylinder
                scale={[1, 1, 0.6]} // Flattened
            />
            {/* Wings */}
            <group position={[0.09, -0.12, -0.05]} rotation={[0, -0.3, -0.15]}>
                <BoneMesh geometry={new THREE.ExtrudeGeometry(wingShape, extrudeSettings)} />
            </group>
            <group position={[-0.09, -0.12, -0.05]} rotation={[0, 0.3, 0.15]} scale={[-1, 1, 1]}>
                <BoneMesh geometry={new THREE.ExtrudeGeometry(wingShape, extrudeSettings)} />
            </group>
            {/* Joints */}
            <BoneMesh position={[0.18, -0.16, 0.06]} geometry={new THREE.SphereGeometry(0.07, 24, 24)} materialProps={{ roughness: 0.4 }} />
            <BoneMesh position={[-0.18, -0.16, 0.06]} geometry={new THREE.SphereGeometry(0.07, 24, 24)} materialProps={{ roughness: 0.4 }} />
        </group>
    )
}

function FemurComplex({ side }: { side: 'left' | 'right' }) {
    const curve = useMemo(() => createFemurCurve(side), [side])

    return (
        <group>
            {/* Head */}
            <BoneMesh position={[side === 'right' ? -0.05 : 0.05, 0.04, 0]} geometry={new THREE.SphereGeometry(0.065, 32, 32)} materialProps={{ roughness: 0.2 }} />
            {/* Neck */}
            <BoneMesh position={[side === 'right' ? -0.03 : 0.03, 0, 0]} rotation={[0, 0, side === 'right' ? 1.0 : -1.0]} geometry={new THREE.CylinderGeometry(0.035, 0.04, 0.08, 12)} />
            {/* Trochanter */}
            <BoneMesh position={[side === 'right' ? 0.05 : -0.05, -0.03, 0]} geometry={new THREE.DodecahedronGeometry(0.05)} />
            {/* Shaft */}
            <BoneMesh position={[0, -0.05, 0]} geometry={new THREE.TubeGeometry(curve, 32, 0.035, 16, false)} />
            {/* Knee Condyles */}
            <group position={[0, -0.9, 0]}>
                <BoneMesh position={[-0.035, 0, 0.02]} geometry={new THREE.SphereGeometry(0.06, 16, 16)} />
                <BoneMesh position={[0.035, 0, 0.02]} geometry={new THREE.SphereGeometry(0.06, 16, 16)} />
            </group>
        </group>
    )
}

// --- Main ---

export function RealisticBody({ simulationStep }: RealisticBodyProps) {
    const pelvisRef = useRef<THREE.Group>(null)
    const spineRef = useRef<THREE.Group>(null)
    const muscleRef = useRef<THREE.Mesh>(null)

    useFrame((state, delta) => {
        if (!pelvisRef.current || !spineRef.current) return

        let targetPelvisX = 0
        let targetSpineX = 0
        // Muscle scale
        let muscleScaleY = 1

        if (simulationStep >= 2) targetPelvisX = 0.35
        if (simulationStep >= 3) targetSpineX = -0.5
        if (simulationStep >= 1) muscleScaleY = 0.9

        pelvisRef.current.rotation.x = THREE.MathUtils.lerp(pelvisRef.current.rotation.x, targetPelvisX, delta * 3)
        spineRef.current.rotation.x = THREE.MathUtils.lerp(spineRef.current.rotation.x, targetSpineX, delta * 3)

        if (muscleRef.current) {
            muscleRef.current.scale.y = THREE.MathUtils.lerp(muscleRef.current.scale.y, muscleScaleY, delta * 3)
        }
    })

    return (
        <group dispose={null} position={[0, -0.3, 0]} scale={1.3}>

            <group ref={pelvisRef}>
                <PelvisComplex />

                {/* Spine Group */}
                <group ref={spineRef} position={[0, 0.15, -0.05]}>
                    <VertebraComplex position={[0, 0, 0]} isRisk={simulationStep >= 3} />
                    <VertebraComplex position={[0, 0.12, 0.005]} rotation={[0.08, 0, 0]} isRisk={simulationStep >= 3} />
                    <VertebraComplex position={[0, 0.24, 0.02]} rotation={[0.05, 0, 0]} isRisk={simulationStep >= 3} />
                    <VertebraComplex position={[0, 0.36, 0.02]} />
                    <VertebraComplex position={[0, 0.48, 0.01]} rotation={[-0.05, 0, 0]} />

                    {/* Ribcage Anchor */}
                    <BoneMesh
                        position={[0, 0.7, 0.05]}
                        geometry={new THREE.CylinderGeometry(0.18, 0.22, 0.3, 16)}
                        materialProps={{ transparent: true, opacity: 0.5, wireframe: true }}
                    />
                </group>

                {/* Muscle: Rectus Femoris */}
                <group position={[0.2, -0.1, 0.18]} rotation={[0.2, 0, 0]}>
                    <mesh
                        ref={muscleRef}
                        position={[0, -0.35, 0]}
                        // Muscle shape: Bulges in middle
                        geometry={new THREE.CapsuleGeometry(0.045, 0.6, 4, 16)}
                        material={simulationStep >= 1 ?
                            new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.4, emissive: '#7f1d1d', emissiveIntensity: 0.5 })
                            : new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4 })}
                    />
                </group>
                <group position={[-0.2, -0.1, 0.18]} rotation={[0.2, 0, 0]}>
                    <mesh position={[0, -0.35, 0]} geometry={new THREE.CapsuleGeometry(0.045, 0.6, 4, 16)} material={new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4, opacity: 0.5, transparent: true })} />
                </group>
            </group>

            <group position={[0, -0.15, 0]}>
                <group position={[0.22, 0, 0.05]}>
                    <FemurComplex side="right" />
                </group>
                <group position={[-0.22, 0, 0.05]}>
                    <FemurComplex side="left" />
                </group>
            </group>
        </group>
    )
}
