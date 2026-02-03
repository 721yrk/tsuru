"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react"
import { updateStaffShifts, updateStaffConcurrentLimit } from "@/app/actions/booking_actions"

type Staff = {
    id: string
    name: string
    maxConcurrentBookings: number
}

type ShiftDefinition = {
    dayOfWeek: number // 0=Sun, 1=Mon...
    startTime: string
    endTime: string
    isActive: boolean
}

type ShiftManagerProps = {
    staffList: Staff[]
    initialShifts: Record<string, ShiftDefinition[]> // map staffId -> shifts
}

const DAYS = ["日", "月", "火", "水", "木", "金", "土"]

export function ShiftManager({ staffList, initialShifts }: ShiftManagerProps) {
    const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || "")
    const [concurrentLimit, setConcurrentLimit] = useState(
        staffList.find(s => s.id === staffList[0]?.id)?.maxConcurrentBookings || 1
    )

    // Manage state for current selected staff's shifts
    // In a real app complexity, we might want to fetch on selection change, but passing all initially is fine for small team
    const [shifts, setShifts] = useState<ShiftDefinition[]>(
        initialShifts[staffList[0]?.id] || DAYS.map((_, i) => ({
            dayOfWeek: i,
            startTime: "09:00",
            endTime: "18:00",
            isActive: i !== 0 // Default Sunday off
        }))
    )

    const handleStaffChange = (staffId: string) => {
        setSelectedStaffId(staffId)
        const staff = staffList.find(s => s.id === staffId)
        if (staff) {
            setConcurrentLimit(staff.maxConcurrentBookings)
            const staffShifts = initialShifts[staffId]
            if (staffShifts && staffShifts.length > 0) {
                // Ensure all days valid
                const merged = DAYS.map((_, i) => {
                    const existing = staffShifts.find(s => s.dayOfWeek === i)
                    return existing || { dayOfWeek: i, startTime: "09:00", endTime: "18:00", isActive: false }
                })
                setShifts(merged)
            } else {
                setShifts(DAYS.map((_, i) => ({
                    dayOfWeek: i,
                    startTime: "09:00",
                    endTime: "18:00",
                    isActive: i !== 0
                })))
            }
        }
    }

    const handleShiftChange = (index: number, field: keyof ShiftDefinition, value: any) => {
        const newShifts = [...shifts]
        newShifts[index] = { ...newShifts[index], [field]: value }
        setShifts(newShifts)
    }

    const handleSave = async () => {
        try {
            await Promise.all([
                updateStaffShifts(selectedStaffId, shifts),
                updateStaffConcurrentLimit(selectedStaffId, concurrentLimit)
            ])
            alert("保存しました")
            window.location.reload()
        } catch (error) {
            console.error(error)
            alert("エラーが発生しました")
        }
    }

    if (!selectedStaffId) return <div>スタッフがいません</div>

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            シフト・受付設定
                        </CardTitle>
                        <CardDescription>
                            スタッフごとの出勤曜日と同時受付数を設定します。
                        </CardDescription>
                    </div>
                    <div className="w-[200px]">
                        <Select value={selectedStaffId} onValueChange={handleStaffChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="スタッフを選択" />
                            </SelectTrigger>
                            <SelectContent>
                                {staffList.map(staff => (
                                    <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* 1. Concurrent Limits */}
                <div className="p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base font-bold flex items-center gap-2">
                                <Users className="h-4 w-4" /> 同時受付可能数 (枠数)
                            </Label>
                            <p className="text-sm text-slate-500 mt-1">
                                同じ時間帯に同時に何件まで予約を受け付けるか設定します。
                            </p>
                        </div>
                        <div className="w-[100px]">
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                value={concurrentLimit}
                                onChange={(e) => setConcurrentLimit(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Weekly Shifts */}
                <div>
                    <Label className="text-base font-bold flex items-center gap-2 mb-4">
                        <Clock className="h-4 w-4" /> 曜日別シフト (繰り返し設定)
                    </Label>
                    <div className="space-y-4">
                        {shifts.map((shift, index) => (
                            <div key={shift.dayOfWeek} className="flex items-center gap-4 p-3 border rounded-md bg-white">
                                <div className="w-16 font-bold text-center">
                                    {DAYS[shift.dayOfWeek]}曜日
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={shift.isActive}
                                        onCheckedChange={(c) => handleShiftChange(index, "isActive", c)}
                                    />
                                    <span className="text-sm text-slate-500 w-16">
                                        {shift.isActive ? "出勤" : "休業"}
                                    </span>
                                </div>

                                {shift.isActive && (
                                    <div className="flex items-center gap-2 ml-4">
                                        <Input
                                            type="time"
                                            value={shift.startTime}
                                            onChange={(e) => handleShiftChange(index, "startTime", e.target.value)}
                                            className="w-32"
                                        />
                                        <span className="text-slate-400">～</span>
                                        <Input
                                            type="time"
                                            value={shift.endTime}
                                            onChange={(e) => handleShiftChange(index, "endTime", e.target.value)}
                                            className="w-32"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            <div className="p-6 pt-0 flex justify-end">
                <Button onClick={handleSave} className="w-[200px]">設定を保存</Button>
            </div>
        </Card>
    )
}
