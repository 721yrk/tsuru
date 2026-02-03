'use client'

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cylinder, Box, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface ProceduralBodyProps {
    simulationStep: number
}

export function ProceduralBody({ simulationStep }: ProceduralBodyProps) {
    const pelvisRef = useRef<THREE.Group>(null)
    const spineRef = useRef<THREE.Group>(null)
    const upperBodyRef = useRef<THREE.Group>(null)

    // Muscles Refs
    const rectusFemorisLeftRef = useRef<THREE.Mesh>(null)
    const rectusFemorisRightRef = useRef<THREE.Mesh>(null)

    // Highlight Materials
    const boneMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.5 }), [])
    const jointMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.6 }), [])
    const muscleNormalMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ef4444', transparent: true, opacity: 0.6 }), [])
    const muscleTightMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b91c1c', emissive: '#7f1d1d', emissiveIntensity: 0.5, transparent: true, opacity: 0.9 }), [])
    const warningMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fbbf24', emissive: '#f59e0b', emissiveIntensity: 0.8 }), [])

    useFrame((state, delta) => {
        if (!pelvisRef.current || !spineRef.current || !upperBodyRef.current) return

        // Animation Logic based on simulationStep
        // Step 0: Neutral
        // Step 1: Muscle Tightening (Red color, slight scale change)
        // Step 2: Anterior Pelvic Tilt (Pelvis rotates X forward)
        // Step 3: Lordosis (Spine compensates, curves back)

        // Target Rotations
        let targetPelvisX = 0
        let targetSpineX = 0
        let muscleScaleY = 1

        if (simulationStep >= 2) {
            targetPelvisX = 0.3 // ~17 degrees tilt forward
        }

        if (simulationStep >= 3) {
            targetSpineX = -0.4 // Compensate back
        }

        if (simulationStep >= 1) {
            muscleScaleY = 0.95 // Shorten slightly visually
        }

        // Smooth Interpolation
        pelvisRef.current.rotation.x = THREE.MathUtils.lerp(pelvisRef.current.rotation.x, targetPelvisX, delta * 2)
        spineRef.current.rotation.x = THREE.MathUtils.lerp(spineRef.current.rotation.x, targetSpineX, delta * 2)

        // Muscle Animation
        if (rectusFemorisLeftRef.current && rectusFemorisRightRef.current) {
            // Color interpolation is hard with swapping materials, so we swap materials in render based on step
            // Scale interpolation
            rectusFemorisLeftRef.current.scale.y = THREE.MathUtils.lerp(rectusFemorisLeftRef.current.scale.y, muscleScaleY, delta * 2)
            rectusFemorisRightRef.current.scale.y = THREE.MathUtils.lerp(rectusFemorisRightRef.current.scale.y, muscleScaleY, delta * 2)
        }
    })

    const isMuscleTight = simulationStep >= 1
    const isSpineRisk = simulationStep >= 3

    return (
        <group>
            {/* --- PELVIS GROUP (Rotates forward) --- */}
            <group ref={pelvisRef} position={[0, 1, 0]}>

                {/* Pelvis Bone */}
                <Box args={[0.5, 0.3, 0.3]} material={boneMaterial} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#cbd5e1" />
                </Box>
                {/* Hip Joints */}
                <Sphere args={[0.12]} position={[-0.2, -0.15, 0]} material={jointMaterial} />
                <Sphere args={[0.12]} position={[0.2, -0.15, 0]} material={jointMaterial} />

                {/* --- SPINE GROUP (Attached to Pelvis, Rotates backward to compensate) --- */}
                <group ref={spineRef} position={[0, 0.15, 0]}>
                    {/* Lumbar Vertebrae (L5-L1) */}
                    {[...Array(5)].map((_, i) => (
                        <Cylinder
                            key={i}
                            args={[0.08, 0.08, 0.15, 16]}
                            position={[0, 0.1 + i * 0.16, i * 0.02]} // Natural curve slightly
                            rotation={[0.1, 0, 0]} // Natural curve
                            material={isSpineRisk && i < 3 ? warningMaterial : boneMaterial} // Highlight lower lumbar on risk
                        />
                    ))}

                    {/* Upper Body (Chest/Head) - Visual reference only */}
                    <group ref={upperBodyRef} position={[0, 1.0, 0.1]}>
                        <Box args={[0.6, 0.8, 0.25]} material={boneMaterial} position={[0, 0, 0]} />
                        <Sphere args={[0.15]} position={[0, 0.5, 0]} material={boneMaterial} /> {/* Head */}
                    </group>
                </group>

                {/* --- FEMURS (Legs get left behind visually when pelvis tilts, attached to hip) --- */}
                {/* Note: In reality, femur stays, pelvis rotates ON femur. 
                    But here pelvis is root for simplicity. If pelvis rotates, legs rotate with it.
                    To make legs stay "grounded" while pelvis tilts, we need to counter-rotate legs or rethink hierarchy.
                    Better hierarchy: Root -> Femurs (Fixed) -> Pelvis (Rotates)
                    Let's adjust hierarchy logic effectively by visual trick:
                    Actually, anterior tilt means pelvis rotates around hip joint.
                    So if Pelvis Group is at [0,1,0] (Hip height), rotation origin should be correct.
                */}
            </group>

            {/* Femurs (Static base to show contrast) */}
            {/* If we put femurs outside Pelvis group, they won't move with pelvis tilt, which is what we want for "grounded feet" effect */}
            <group position={[0, 1, 0]}> {/* Same origin as Pelvis */}
                <group position={[-0.2, -0.15, 0]}> {/* Left Hip position */}
                    <Cylinder args={[0.06, 0.05, 0.8]} position={[0, -0.4, 0]} material={boneMaterial} />
                    <Sphere args={[0.07]} position={[0, -0.8, 0]} material={jointMaterial} /> {/* Knee */}
                </group>
                <group position={[0.2, -0.15, 0]}> {/* Right Hip position */}
                    <Cylinder args={[0.06, 0.05, 0.8]} position={[0, -0.4, 0]} material={boneMaterial} />
                    <Sphere args={[0.07]} position={[0, -0.8, 0]} material={jointMaterial} /> {/* Knee */}
                </group>
            </group>

            {/* --- MUSCLES --- */}
            {/* Rectus Femoris: From AIIS (Pelvis) to Patella (Knee) */}
            {/* Since Pelvis rotates, the top attachment point moves. Bottom (Knee) is static. */}
            {/* We need to calculate start/end points dynamically? 
                Or we can put it inside Pelvis group? No, bottom is fixed to knee.
                Tube/Cylinder connecting moving point (Pelvis) and fixed point (Knee).
                For simple visualization, we can attach it to Pelvis and make it point to Knee.
                OR simpler: use a Cylinder within Pelvis group that stretches?
                No, connecting two spaces is best done with a custom component or looking at world positions.
                For this "Procedural" simplicity, let's just make it a child of Pelvis (AIIS) and rotate it to point down?
                If pelvis tilts forward (X rotation), the attachment point moves down/forward.
                The muscle should visualize "Shortening".
            */}

            {/* Simplified approach: Put muscle in Pelvis group, representing the "Upper part" that pulls? 
                No, let's put it in World and update its transform. 
                Actually, simpler: Just put it in the "Legs" group (fixed) but scale/rotate it to look like it's pulling?
                Let's stick to: Muscle connects Pelvis (Front) to Knee. 
            */}

            {/* Let's try to put it in the Pelvis group, but angling back towards knee. */}
            <group position={[0, 1, 0]} rotation={[pelvisRef.current?.rotation.x || 0, 0, 0]}>
                {/* This approach is reactive, but useRef value isn't available in render immediately. 
                    Let's rely on the visual trick: The muscle is attached to the pelvis primarily.
                */}
            </group>

            {/* Better: Visual representation of muscle attached to fixed leg, but scaling up to pelvis? */}
            {/* Left Rectus Femoris */}
            <mesh
                ref={rectusFemorisLeftRef}
                position={[-0.2, 0.5, 0.15]} // Midpoint roughly
                rotation={[0, 0, 0]}
                material={isMuscleTight ? muscleTightMaterial : muscleNormalMaterial}
            >
                {/* We use a Capsule or Cylinder to represent the muscle belly */}
                {/* Position needs to be careful. Let's just place it statically for now relative to legs/pelvis visually */}
                <Cylinder args={[0.04, 0.03, 0.7]} position={[0, 0, 0]} />
            </mesh>

            {/* Right Rectus Femoris */}
            <mesh
                ref={rectusFemorisRightRef}
                position={[0.2, 0.5, 0.15]}
                material={isMuscleTight ? muscleTightMaterial : muscleNormalMaterial}
            >
                <Cylinder args={[0.04, 0.03, 0.7]} position={[0, 0, 0]} />
            </mesh>

            {/* Note: The muscle visuals are simplified. 
                 Correctly rigging this in React Three Fiber without a skeleton is tricky.
                 The current setup has static muscles. 
                 We will improve this by parenting them to the Pelvis so they move WITH the tilt, 
                 showing that they are "Shortened" because they pulled the pelvis down.
             */}
        </group>
    )
}
