
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Target, Edit2, Save, X, Lightbulb, Compass, Flag } from "lucide-react"
import { updateMemberVision } from "@/app/actions/members_actions"

export function VisionCard({ member }: { member: any }) {
    const [isEditing, setIsEditing] = useState(false)
    const [goal, setGoal] = useState(member.goals || "")
    const [purpose, setPurpose] = useState(member.purpose || "")
    const [vision, setVision] = useState(member.vision || "")

    const handleSave = async () => {
        await updateMemberVision(member.id, { goals: goal, purpose, vision })
        setIsEditing(false)
    }

    return (
        <Card className="h-full border-l-4 border-l-amber-400 shadow-sm hover:shadow-md transition-shadow bg-amber-50/30">
            <CardHeader className="pb-2 flex flex-row justify-between items-center border-b bg-white/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-800">
                    <Target className="w-4 h-4" />
                    ライフ・ビジョン
                </CardTitle>
                {!isEditing ? (
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-3 h-3 text-slate-400" />
                    </Button>
                ) : (
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => setIsEditing(false)}><X className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-indigo-500" onClick={handleSave}><Save className="w-3 h-3" /></Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-4 flex flex-col h-[calc(100%-3.5rem)]">
                {/* 1. Goal */}
                <div className="flex-1 flex flex-col pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-1">
                        <Flag className="w-3 h-3" /> Goal (定量目標)
                    </div>
                    {isEditing ? (
                        <Textarea value={goal} onChange={e => setGoal(e.target.value)} className="bg-white text-xs min-h-[50px] max-h-[60px] overflow-y-auto resize-none" placeholder="ベンチプレス100kg" rows={2} />
                    ) : (
                        <div className="bg-white p-2 rounded border border-amber-100 font-bold text-slate-800 shadow-sm text-xs flex-1 overflow-y-auto whitespace-pre-wrap">
                            {member.goals || "--"}
                        </div>
                    )}
                </div>

                {/* 2. Purpose */}
                <div className="flex-1 flex flex-col pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-1">
                        <Compass className="w-3 h-3" /> Purpose (目的)
                    </div>
                    {isEditing ? (
                        <Textarea value={purpose} onChange={e => setPurpose(e.target.value)} className="bg-white text-xs min-h-[50px] max-h-[60px] overflow-y-auto resize-none" placeholder="健康維持のため" rows={2} />
                    ) : (
                        <div className="text-xs text-slate-700 px-2 py-1 bg-white/50 rounded flex-1 overflow-y-auto whitespace-pre-wrap">
                            {member.purpose || "--"}
                        </div>
                    )}
                </div>

                {/* 3. Vision */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-1">
                        <Lightbulb className="w-3 h-3" /> Vision (未来)
                    </div>
                    {isEditing ? (
                        <Textarea value={vision} onChange={e => setVision(e.target.value)} className="bg-white text-xs min-h-[50px] max-h-[60px] overflow-y-auto resize-none" placeholder="家族とずっと笑って過ごす" rows={2} />
                    ) : (
                        <div className="text-xs text-slate-600 italic border-l-2 border-amber-300 pl-2 py-1 flex-1 overflow-y-auto whitespace-pre-wrap">
                            {member.vision || "--"}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
