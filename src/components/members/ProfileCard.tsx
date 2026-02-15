
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import { differenceInYears, format } from "date-fns"
import ProfileEditModal from "@/components/crm/ProfileEditModal"

export function ProfileCard({ member }: { member: any }) {

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


    const genderLabel = member.gender === "MALE" ? "男性" : "女性"

    return (
        <Card className="h-full border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 bg-slate-50 border-b flex flex-row justify-between items-center">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-indigo-600" />
                    パーソナル・プロファイル (DEBUG)
                </CardTitle>
                <div className="flex gap-1">
                    <ProfileEditModal member={member} />
                </div>
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
                    <span>{member.height ? `${member.height}cm` : "未設定"}</span>
                </div>

                <div className="border-t pt-2" />

                {/* 6. Medical History */}
                <div className="space-y-1">
                    <div className="text-xs font-bold text-red-400">既往歴</div>
                    <div className="bg-red-50 p-2 rounded text-xs text-slate-700 min-h-[40px] max-h-[60px] overflow-y-auto whitespace-pre-wrap">
                        {member.medicalHistory || "なし"}
                    </div>
                </div>

                {/* 7. Exercise History */}
                <div className="space-y-1">
                    <div className="text-xs font-bold text-blue-400">運動歴</div>
                    <div className="bg-blue-50 p-2 rounded text-xs text-slate-700 min-h-[40px] max-h-[60px] overflow-y-auto whitespace-pre-wrap">
                        {member.exerciseHistory || "なし"}
                    </div>
                </div>

                {/* 8. Current Condition */}
                <div className="space-y-1">
                    <div className="text-xs font-bold text-amber-400">現在の怪我や病気</div>
                    <div className="bg-amber-50 p-2 rounded text-xs text-slate-700 min-h-[40px] max-h-[60px] overflow-y-auto whitespace-pre-wrap">
                        {member.currentCondition || "なし"}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
