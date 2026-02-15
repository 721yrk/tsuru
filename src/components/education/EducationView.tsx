'use client'

import { useState } from 'react'
import { EDUCATION_CONTENTS } from '@/lib/education_data'
import { VisualCanvas } from './VisualCanvas'
import { ScriptPanel } from './ScriptPanel'
import { SceneContainer } from './3d/SceneContainer'
import { RECTUS_FEMORIS_SIMULATION } from '@/lib/simulation_data'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react'

export function EducationView() {
    const [currentTab, setCurrentTab] = useState("3d-simulation") // Default to 3D for demo
    const [simStep, setSimStep] = useState(0)

    const activeContent = EDUCATION_CONTENTS.find(c => c.id === currentTab) || EDUCATION_CONTENTS[0]

    const handleNextStep = () => {
        if (simStep < RECTUS_FEMORIS_SIMULATION.length - 1) {
            setSimStep(prev => prev + 1)
        }
    }

    const handlePrevStep = () => {
        if (simStep > 0) {
            setSimStep(prev => prev - 1)
        }
    }

    const handleReset = () => {
        setSimStep(0)
    }

    const currentSimData = RECTUS_FEMORIS_SIMULATION[simStep]

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-4 p-4">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4 mb-4 h-12 flex-shrink-0">
                    <TabsTrigger
                        value="3d-simulation"
                        className="font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all flex items-center gap-2"
                    >
                        <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
                        3D連動シミュレーション
                    </TabsTrigger>
                    {EDUCATION_CONTENTS.map((content) => (
                        <TabsTrigger
                            key={content.id}
                            value={content.id}
                            className="font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
                        >
                            {content.title}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* 3D Simulation Tab Content */}
                <TabsContent value="3d-simulation" className="flex-1 min-h-0 mt-0 data-[state=active]:flex flex-col gap-0 h-full hidden">
                    <div className="flex flex-col lg:flex-row gap-6 h-full">
                        {/* Left: 3D Scene */}
                        <div className="flex-[3] bg-slate-900 rounded-2xl shadow-inner border border-slate-800 overflow-hidden relative min-h-[400px]">
                            <SceneContainer simulationStep={simStep} />

                            {/* Overlay Controls */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-white/90 hover:bg-white text-slate-800"
                                    onClick={handleReset}
                                >
                                    <RotateCcw className="w-4 h-4 mr-1" /> リセット
                                </Button>
                            </div>
                        </div>

                        {/* Right: Simulation Controls & Explanation */}
                        <div className="flex-[2] flex flex-col bg-white rounded-2xl p-6 shadow-xl shadow-purple-100/50 border border-purple-100 overflow-hidden">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm min-w-fit">
                                        Step {simStep + 1}/{RECTUS_FEMORIS_SIMULATION.length}
                                    </span>
                                    {currentSimData.title}
                                </h2>
                                <p className="text-slate-600 leading-relaxed min-h-[80px]">
                                    {currentSimData.description}
                                </p>
                            </div>

                            <div className="flex items-center justify-between gap-4 mt-auto pt-6 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevStep}
                                    disabled={simStep === 0}
                                    className="flex-1"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    戻る
                                </Button>
                                <Button
                                    onClick={handleNextStep}
                                    disabled={simStep === RECTUS_FEMORIS_SIMULATION.length - 1}
                                    className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {simStep === RECTUS_FEMORIS_SIMULATION.length - 1 ? (
                                        "シミュレーション完了"
                                    ) : (
                                        <>
                                            次へ進む ({RECTUS_FEMORIS_SIMULATION[simStep + 1].title})
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Tips Area */}
                            <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Trainer's Guide</h3>
                                <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                                    <li>画面をドラッグして様々な角度から見せてください。</li>
                                    <li>「筋肉が縮むと骨がどう動くか」に注目させてください。</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Existing Tabs Content (Wrapped in TabsContent) */}
                {EDUCATION_CONTENTS.map((content) => (
                    <TabsContent key={content.id} value={content.id} className="flex-1 min-h-0 mt-0 data-[state=active]:flex flex-col gap-0 h-full hidden">
                        <div className="flex flex-col lg:flex-row gap-6 h-full">
                            <div className="flex-[3] flex flex-col min-h-[400px] lg:min-h-0 bg-slate-50 rounded-2xl p-4 shadow-inner border border-slate-200">
                                <div className="mb-2 px-2 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700">{content.title}</h3>
                                    <span className="text-xs text-slate-400">図に書き込みができます</span>
                                </div>
                                <div className="flex-1 relative">
                                    <VisualCanvas
                                        key={content.id}
                                        imagePath={content.imagePath}
                                        altText={content.title}
                                    />
                                </div>
                            </div>
                            <div className="flex-[2] flex flex-col min-h-0 bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                                <ScriptPanel content={content} />
                            </div>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
