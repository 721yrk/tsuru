'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Eraser, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VisualCanvasProps {
    imagePath: string
    altText: string
}

const COLORS = [
    { id: 'red', value: '#EF4444', label: '赤' },
    { id: 'blue', value: '#3B82F6', label: '青' },
    { id: 'black', value: '#000000', label: '黒' },
]

export function VisualCanvas({ imagePath, altText }: VisualCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState('#EF4444')
    const [lineWidth, setLineWidth] = useState(4)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size to match container
        // In a real app, we might want to handle resize events
        canvas.width = canvas.parentElement?.clientWidth || 800
        canvas.height = canvas.parentElement?.clientHeight || 600

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
    }, [])

    // Update context settings when state changes
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
    }, [color, lineWidth])

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        ctx.beginPath()
        ctx.moveTo(x, y)
        setIsDrawing(true)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        ctx.lineTo(x, y)
        ctx.stroke()
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="relative flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center bg-dots">
                {/* Background Image */}
                {/* Use img tag for simplicity, keeping aspect ratio */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imagePath}
                        alt={altText}
                        className="max-w-full max-h-full object-contain pointer-events-none select-none"
                    />
                </div>

                {/* Canvas Layer */}
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                    <Pencil className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-500">ペン</span>
                </div>

                <div className="flex gap-2">
                    {COLORS.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setColor(c.value)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c.value ? 'border-slate-400 scale-110 shadow-sm' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: c.value }}
                            title={c.label}
                        />
                    ))}
                </div>

                <div className="w-px h-8 bg-slate-200 mx-2" />

                <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-slate-500 hover:text-red-500 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    クリア
                </Button>
            </div>

            <style jsx>{`
                .bg-dots {
                    background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    )
}
