
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { HeartPulse, Save, BookOpen } from "lucide-react"
import { addConditioningLog, getConditioningLogs } from "@/app/actions/members_actions"
import { format } from "date-fns"

export function ConditioningLogger({ memberId }: { memberId: string }) {
    const [logs, setLogs] = useState<any[]>([])
    const [stiffness, setStiffness] = useState("")
    const [weakness, setWeakness] = useState("")
    const [adjustment, setAdjustment] = useState("")

    useEffect(() => {
        const load = async () => {
            const data = await getConditioningLogs(memberId)
            setLogs(data)
        }
        load()
    }, [memberId])

    const handleSave = async () => {
        if (!stiffness && !weakness && !adjustment) return
        await addConditioningLog(memberId, { stiffness, weakness, adjustment })
        setStiffness("")
        setWeakness("")
        setAdjustment("")
        const data = await getConditioningLogs(memberId)
        setLogs(data)
    }

    return (
        <Card className="h-full border-t-4 border-t-pink-400 shadow-sm">
            <CardHeader className="pb-2 border-b bg-pink-50/30 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-pink-700">
                    <HeartPulse className="w-4 h-4" />
                    ボディ・コンディショニング記録
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-pink-600 hover:text-pink-700 hover:bg-pink-100"
                    onClick={() => window.open('/dashboard/education', '_blank')}
                >
                    <BookOpen className="w-3 h-3 mr-1" />
                    説明ツールを開く
                </Button>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden" style={{ height: 'calc(100% - 3.5rem)' }}>
                {/* Input Form */}
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500">硬い部位 (Stiffness)</label>
                        <Textarea value={stiffness} onChange={e => setStiffness(e.target.value)} className="min-h-[40px] max-h-[60px] text-xs bg-slate-50 overflow-y-auto resize-none" placeholder="例: 右僧帽筋" rows={2} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">弱い部位 (Weakness)</label>
                        <Textarea value={weakness} onChange={e => setWeakness(e.target.value)} className="min-h-[40px] max-h-[60px] text-xs bg-slate-50 overflow-y-auto resize-none" placeholder="例: 内転筋" rows={2} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">調整アプローチ (Adjustment)</label>
                        <Textarea value={adjustment} onChange={e => setAdjustment(e.target.value)} className="min-h-[40px] max-h-[60px] text-xs bg-slate-50 overflow-y-auto resize-none" placeholder="例: 骨盤矯正" rows={2} />
                    </div>
                    <Button onClick={handleSave} className="w-full h-8 text-xs bg-pink-500 hover:bg-pink-600 text-white">
                        <Save className="w-3 h-3 mr-1" /> 記録する
                    </Button>
                </div>

                {/* Log List */}
                <div className="bg-slate-50 rounded p-2 overflow-y-auto h-full min-h-0 flex flex-col">
                    <div className="text-xs font-bold text-slate-400 mb-2">最近の履歴</div>
                    {logs.length === 0 && <div className="text-xs text-slate-300 text-center py-4">履歴なし</div>}
                    <div className="flex-1 overflow-y-auto space-y-2" style={{ minHeight: 0 }}>
                        {logs.map(log => (
                            <div key={log.id} className="bg-white p-2 rounded border shadow-sm text-xs">
                                <div className="font-bold text-pink-600 mb-1">{format(new Date(log.date), 'MM/dd HH:mm')}</div>
                                <div className="grid grid-cols-3 gap-1 text-[10px]">
                                    <div className="bg-slate-100 p-1 rounded max-h-[60px] overflow-y-auto">
                                        <span className="text-slate-400 block">硬</span>
                                        <div className="whitespace-pre-wrap break-words">{log.stiffness || "-"}</div>
                                    </div>
                                    <div className="bg-slate-100 p-1 rounded max-h-[60px] overflow-y-auto">
                                        <span className="text-slate-400 block">弱</span>
                                        <div className="whitespace-pre-wrap break-words">{log.weakness || "-"}</div>
                                    </div>
                                    <div className="bg-pink-50 text-pink-800 p-1 rounded max-h-[60px] overflow-y-auto">
                                        <span className="text-pink-300 block">整</span>
                                        <div className="whitespace-pre-wrap break-words">{log.adjustment || "-"}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
