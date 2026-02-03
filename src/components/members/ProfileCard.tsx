
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { User, Edit2, Save, X } from "lucide-react"
import { updateMemberProfile } from "@/app/actions/members_actions"
import { differenceInYears, format } from "date-fns"

export function ProfileCard({ member }: { member: any }) {
    const [isEditing, setIsEditing] = useState(false)
    const [medical, setMedical] = useState(member.medicalHistory || "")
    const [exercise, setExercise] = useState(member.exerciseHistory || "")
    const [height, setHeight] = useState(member.height?.toString() || "")
    const [currentCondition, setCurrentCondition] = useState(member.currentCondition || "")

    const age = differenceInYears(new Date(), new Date(member.dateOfBirth))
    const dob = format(new Date(member.dateOfBirth), "yyyy年MM月dd日")

    // Rank Logic
    const joinDate = new Date(member.joinDate)
    const joinDateStr = format(joinDate, "yyyy年MM月dd日")
    const tenure = differenceInYears(new Date(), joinDate)
    let rank = "REGULAR"; let color = "bg-slate-100 text-slate-600"
    if (tenure >= 10) { rank = "DIAMOND"; color = "bg-blue-100 text-blue-700" }
    else if (tenure >= 7) { rank = "PLATINUM"; color = "bg-slate-700 text-white" }
    else if (tenure >= 5) { rank = "GOLD"; color = "bg-yellow-100 text-yellow-700" }
    else if (tenure >= 3) { rank = "SILVER"; color = "bg-slate-200 text-slate-700" }
    else if (tenure >= 1) { rank = "BRONZE"; color = "bg-amber-100 text-amber-700" }

    const handleSave = async () => {
        await updateMemberProfile(member.id, {
            medicalHistory: medical,
            exerciseHistory: exercise,
            height: height ? parseFloat(height) : null,
            currentCondition: currentCondition
        })
        setIsEditing(false)
    }

    const genderLabel = member.gender === "MALE" ? "男性" : "女性"

    return (
        <Card className="h-full border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 bg-slate-50 border-b flex flex-row justify-between items-center">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-emerald-600" />
                    パーソナル・プロファイル
                </CardTitle>
                {!isEditing ? (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-3 h-3 text-slate-400" />
                    </Button>
                ) : (
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setIsEditing(false)}><X className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-500" onClick={handleSave}><Save className="w-3 h-3" /></Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
                {/* 1. Name + Age + Gender */}
                <div className="flex items-baseline gap-2">
                    <div className="font-bold text-lg text-slate-800">{member.name}</div>
                    <div className="text-slate-500">({age}歳)</div>
                    <div className="text-slate-500">{genderLabel}</div>
                </div>

                {/* 2. Date of Birth */}
                <div className="text-xs text-slate-600">
                    <span className="text-slate-400">生年月日:</span> {dob}
                </div>

                {/* 3. Join Date */}
                <div className="text-xs text-slate-600">
                    <span className="text-slate-400">入会日:</span> {joinDateStr}
                </div>

                {/* 4. Rank + Tenure */}
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${color}`}>{rank}</span>
                    <span className="text-xs text-slate-400">在籍{tenure}年</span>
                </div>

                {/* 5. Height */}
                <div className="text-xs text-slate-600">
                    <span className="text-slate-400">身長:</span>{" "}
                    {isEditing ? (
                        <Input
                            type="number"
                            className="inline-block w-20 h-6 text-xs px-2"
                            value={height}
                            onChange={e => setHeight(e.target.value)}
                            placeholder="cm"
                        />
                    ) : (
                        <span>{member.height ? `${member.height}cm` : "未設定"}</span>
                    )}
                </div>

                <div className="border-t pt-2" />

                {/* 6. Medical History */}
                <div className="space-y-1">
                    <div className="text-xs font-bold text-red-400">既往歴</div>
                    {isEditing ? (
                        <Textarea
                            className="text-xs min-h-[50px] max-h-[60px] overflow-y-auto resize-none"
                            placeholder="既往歴 (怪我、病気など)"
                            value={medical}
                            onChange={e => setMedical(e.target.value)}
                            rows={2}
                        />
                    ) : (
                        <div className="bg-red-50 p-2 rounded text-xs text-slate-700 min-h-[40px] max-h-[60px] overflow-y-auto whitespace-pre-wrap">
                            {member.medicalHistory || "なし"}
                        </div>
                    )}
                </div>

                {/* 7. Exercise History */}
                <div className="space-y-1">
                    <div className="text-xs font-bold text-blue-400">運動歴</div>
                    {isEditing ? (
                        <Textarea
                            className="text-xs min-h-[50px] max-h-[60px] overflow-y-auto resize-none"
                            placeholder="運動歴 (スポーツ経験など)"
                            value={exercise}
                            onChange={e => setExercise(e.target.value)}
                            rows={2}
                        />
                    ) : (
                        <div className="bg-blue-50 p-2 rounded text-xs text-slate-700 min-h-[40px] max-h-[60px] overflow-y-auto whitespace-pre-wrap">
                            {member.exerciseHistory || "なし"}
                        </div>
                    )}
                </div>

                {/* 8. Current Condition */}
                <div className="space-y-1">
                    <div className="text-xs font-bold text-amber-400">現在の怪我や病気</div>
                    {isEditing ? (
                        <Textarea
                            className="text-xs min-h-[50px] max-h-[60px] overflow-y-auto resize-none"
                            placeholder="現在の怪我や病気の状態"
                            value={currentCondition}
                            onChange={e => setCurrentCondition(e.target.value)}
                            rows={2}
                        />
                    ) : (
                        <div className="bg-amber-50 p-2 rounded text-xs text-slate-700 min-h-[40px] max-h-[60px] overflow-y-auto whitespace-pre-wrap">
                            {member.currentCondition || "なし"}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
