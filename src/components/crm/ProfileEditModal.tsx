'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { updateMemberProfile } from "@/app/actions/member_profile_actions" // Action to create
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"

interface ProfileEditModalProps {
    member: any // Type as any for now to avoid complexity, ideally proper Prisma type
}

export default function ProfileEditModal({ member }: ProfileEditModalProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: member.name || "",
        kana: member.memberProfile?.kana || "",
        gender: member.memberProfile?.gender || "UNKNOWN",
        dateOfBirth: member.memberProfile?.dateOfBirth ? new Date(member.memberProfile.dateOfBirth).toISOString().split('T')[0] : "",
        joinDate: member.memberProfile?.joinDate ? new Date(member.memberProfile.joinDate).toISOString().split('T')[0] : "",
        height: member.height?.toString() || "",
        medicalHistory: member.medicalHistory || "",
        exerciseHistory: member.exerciseHistory || "",
        currentCondition: member.currentCondition || "",
    })

    // Reset form when modal opens to ensure fresh data
    useEffect(() => {
        if (open) {
            setFormData({
                name: member.name || "",
                kana: member.memberProfile?.kana || "",
                gender: member.memberProfile?.gender || "UNKNOWN",
                dateOfBirth: member.memberProfile?.dateOfBirth ? new Date(member.memberProfile.dateOfBirth).toISOString().split('T')[0] : "",
                joinDate: member.memberProfile?.joinDate ? new Date(member.memberProfile.joinDate).toISOString().split('T')[0] : "",
                height: member.height?.toString() || "",
                medicalHistory: member.medicalHistory || "",
                exerciseHistory: member.exerciseHistory || "",
                currentCondition: member.currentCondition || "",
            })
        }
    }, [open, member])

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const formDataToSend = new FormData()
            // Determine userId: if member.userId exists (Member resource), use it. Otherwise assume member.id is userId (User resource).
            const targetUserId = member.userId || member.id
            formDataToSend.append('userId', targetUserId)
            formDataToSend.append('name', formData.name)
            formDataToSend.append('kana', formData.kana)
            formDataToSend.append('gender', formData.gender)
            formDataToSend.append('dateOfBirth', formData.dateOfBirth)
            formDataToSend.append('joinDate', formData.joinDate)
            formDataToSend.append('height', formData.height)
            formDataToSend.append('medicalHistory', formData.medicalHistory)
            formDataToSend.append('exerciseHistory', formData.exerciseHistory)
            formDataToSend.append('currentCondition', formData.currentCondition)

            const result = await updateMemberProfile(formDataToSend)

            if (result.success) {
                setOpen(false)
                router.refresh()
            } else {
                alert(result.error || "保存に失敗しました")
            }
        } catch (error) {
            console.error(error)
            alert("エラーが発生しました")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>基本情報を編集</DialogTitle>
                    <DialogDescription>
                        メンバーの基本プロフィールを変更します。
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            名前
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="kana" className="text-right">
                            ふりがな
                        </Label>
                        <Input
                            id="kana"
                            value={formData.kana}
                            onChange={(e) => setFormData({ ...formData, kana: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="gender" className="text-right">
                            性別
                        </Label>
                        <Select
                            value={formData.gender}
                            onValueChange={(val) => setFormData({ ...formData, gender: val })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="性別を選択" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MALE">男性</SelectItem>
                                <SelectItem value="FEMALE">女性</SelectItem>
                                <SelectItem value="UNKNOWN">回答しない/不明</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dob" className="text-right">
                            生年月日
                        </Label>
                        <Input
                            id="dob"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="joinDate" className="text-right">
                            入会日
                        </Label>
                        <Input
                            id="joinDate"
                            type="date"
                            value={formData.joinDate}
                            onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="height" className="text-right">
                            身長 (cm)
                        </Label>
                        <Input
                            id="height"
                            type="number"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            className="col-span-3"
                            placeholder="160"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Label htmlFor="medicalHistory" className="text-right pt-2">
                            既往歴
                        </Label>
                        <Textarea
                            id="medicalHistory"
                            value={formData.medicalHistory}
                            onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                            className="col-span-3 min-h-[60px]"
                            placeholder="既往歴 (怪我、病気など)"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Label htmlFor="exerciseHistory" className="text-right pt-2">
                            運動歴
                        </Label>
                        <Textarea
                            id="exerciseHistory"
                            value={formData.exerciseHistory}
                            onChange={(e) => setFormData({ ...formData, exerciseHistory: e.target.value })}
                            className="col-span-3 min-h-[60px]"
                            placeholder="運動歴 (スポーツ経験など)"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Label htmlFor="currentCondition" className="text-right pt-2">
                            現在の状態
                        </Label>
                        <Textarea
                            id="currentCondition"
                            value={formData.currentCondition}
                            onChange={(e) => setFormData({ ...formData, currentCondition: e.target.value })}
                            className="col-span-3 min-h-[60px]"
                            placeholder="現在の怪我や病気の状態"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        キャンセル
                    </Button>
                    <Button type="submit" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "保存中..." : "保存する"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
