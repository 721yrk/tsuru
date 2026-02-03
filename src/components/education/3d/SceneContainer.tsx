'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, SSAO, Vignette } from '@react-three/postprocessing'
import { RealisticBody } from './RealisticBody'
import { Suspense, useState, useEffect } from 'react'

interface SceneContainerProps {
    simulationStep: number
}

export function SceneContainer({ simulationStep }: SceneContainerProps) {
    return (
        <div className="w-full h-full bg-slate-100/50 relative rounded-xl overflow-hidden shadow-inner border border-slate-200">
            {/* Background Color Update: Cleaner look */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-200 pointer-events-none" />

            <Canvas shadows className="touch-none" gl={{ preserveDrawingBuffer: true, antialias: false }}>
                <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={35} />

                <Suspense fallback={<LoadingFallback />}>
                    {/* Lighting: Studio Quality */}
                    <ambientLight intensity={0.5} />
                    <directionalLight
                        position={[5, 5, 5]}
                        intensity={1.0}
                        castShadow
                        shadow-bias={-0.0001}
                    />
                    <spotLight position={[-5, 5, 2]} intensity={0.5} angle={0.5} penumbra={1} />
                    <Environment preset="studio" />

                    {/* The Body Model */}
                    <group position={[0, -0.8, 0]}>
                        <RealisticBody simulationStep={simulationStep} />
                    </group>

                    {/* Floor & Shadows */}
                    <ContactShadows resolution={1024} scale={10} blur={1} opacity={0.5} far={1} color="#1e293b" />

                    {/* Post Processing for reliable medical look */}
                    <EffectComposer disableNormalPass={false} multisampling={4}>
                        <SSAO radius={0.1} intensity={15} luminanceInfluence={0.5} color="black" />
                        <Bloom luminanceThreshold={0.9} mipmapBlur intensity={0.5} radius={0.5} />
                        <Vignette eskil={false} offset={0.1} darkness={0.5} />
                    </EffectComposer>

                </Suspense>

                <OrbitControls
                    makeDefault
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 1.8}
                    enablePan={true}
                    minDistance={2}
                    maxDistance={8}
                    target={[0, 0, 0]}
                    dampingFactor={0.05}
                />
            </Canvas>

            <div className="absolute bottom-4 left-4 pointer-events-none bg-white/60 p-2 rounded text-[10px] text-slate-500 backdrop-blur-sm border border-white/50">
                左クリック: 回転 | 右クリック: 移動 | ホイール: ズーム
            </div>
        </div>
    )
}

function LoadingFallback() {
    return (
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="gray" wireframe />
        </mesh>
    )
}
