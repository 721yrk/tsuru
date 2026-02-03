'use client'

import { EducationContent } from '@/lib/education_data'
import { CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react'

interface ScriptPanelProps {
    content: EducationContent
}

export function ScriptPanel({ content }: ScriptPanelProps) {
    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-emerald-600" />
                    標準トークスクリプト
                </h2>
                <p className="text-sm text-slate-500">
                    お客様の反応を見ながら、以下の流れで説明を進めてください。
                </p>
            </div>

            <div className="space-y-6">
                {/* Step 1 */}
                <StepCard
                    stepNumber={1}
                    title={content.script.step1.title}
                    text={content.script.step1.text}
                    color="blue"
                />

                {/* Step 2 */}
                <StepCard
                    stepNumber={2}
                    title={content.script.step2.title}
                    text={content.script.step2.text}
                    color="indigo"
                />

                {/* Step 3 */}
                <StepCard
                    stepNumber={3}
                    title={content.script.step3.title}
                    text={content.script.step3.text}
                    color="emerald"
                />
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    重要チェックポイント
                </h3>
                <ul className="space-y-2">
                    {content.checkpoints.map((cp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                            {cp}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

function StepCard({ stepNumber, title, text, color }: { stepNumber: number, title: string, text: string, color: 'blue' | 'indigo' | 'emerald' }) {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-100 text-blue-900 ring-blue-500',
        indigo: 'bg-indigo-50 border-indigo-100 text-indigo-900 ring-indigo-500',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-900 ring-emerald-500',
    }

    const badgeClasses = {
        blue: 'bg-blue-500 text-white',
        indigo: 'bg-indigo-500 text-white',
        emerald: 'bg-emerald-500 text-white',
    }

    return (
        <div className={`relative p-5 rounded-xl border ${colorClasses[color]} shadow-sm transition-all hover:shadow-md`}>
            <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm ${badgeClasses[color]}`}>
                {stepNumber}
            </div>

            <h3 className="font-bold mb-3 pl-2 flex items-center gap-2">
                {title}
            </h3>

            <div className="relative pl-4 border-l-2 border-slate-200 ml-1">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {text}
                </p>
            </div>
        </div>
    )
}
