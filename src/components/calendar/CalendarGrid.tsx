
"use client"

import { useState } from "react"
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addDays,
    startOfDay,
    isWithinInterval
} from "date-fns"
import { ja } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Reservation = {
    id: string
    startTime: Date
    endTime: Date
    member: {
        name: string
        rank: string
    }
    status: string
}

export function CalendarGrid({ reservations }: { reservations: Reservation[] }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK'>('MONTH')
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

    const nextPeriod = () => {
        if (viewMode === 'MONTH') {
            setCurrentDate(addMonths(currentDate, 1))
        } else {
            setCurrentDate(addDays(currentDate, 7))
        }
    }

    const prevPeriod = () => {
        if (viewMode === 'MONTH') {
            setCurrentDate(subMonths(currentDate, 1))
        } else {
            setCurrentDate(addDays(currentDate, -7))
        }
    }

    const getDaysOrHours = () => {
        if (viewMode === 'MONTH') {
            const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
            const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
            return eachDayOfInterval({ start, end })
        } else {
            // For week view, just return the 7 days of the current week
            const start = startOfWeek(currentDate, { weekStartsOn: 0 })
            const end = endOfWeek(currentDate, { weekStartsOn: 0 })
            return eachDayOfInterval({ start, end })
        }
    }

    const days = getDaysOrHours()

    const getDailyReservations = (date: Date) => {
        return reservations.filter(res => isSameDay(new Date(res.startTime), date))
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevPeriod}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="w-32 text-center">
                        {format(currentDate, 'yyyy年 M月', { locale: ja })}
                    </span>
                    <Button variant="outline" size="icon" onClick={nextPeriod}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </CardTitle>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === 'MONTH' ? "default" : "outline"}
                        onClick={() => setViewMode('MONTH')}
                        size="sm"
                    >
                        月 (Month)
                    </Button>
                    <Button
                        variant={viewMode === 'WEEK' ? "default" : "outline"}
                        onClick={() => setViewMode('WEEK')}
                        size="sm"
                    >
                        週 (Week)
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b">
                    {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                        <div key={d} className={`p-2 text-center text-sm font-medium ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-neutral-500'}`}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className={`grid grid-cols-7 ${viewMode === 'MONTH' ? 'auto-rows-[minmax(120px,1fr)]' : 'h-[600px] auto-rows-fr'}`}>
                    {days.map((day, i) => {
                        const dailyRes = getDailyReservations(day)
                        const isToday = isSameDay(day, new Date())
                        const isCurrentMonth = isSameMonth(day, currentDate)

                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "border-b border-r p-2 min-h-[100px] relative transition hover:bg-neutral-50 cursor-pointer",
                                    !isCurrentMonth && "bg-neutral-50/50 text-neutral-400",
                                    isToday && "bg-blue-50/30"
                                )}
                                onClick={() => setSelectedDate(day)}
                            >
                                <div className={cn(
                                    "text-sm w-7 h-7 flex items-center justify-center rounded-full mb-1",
                                    isToday ? "bg-blue-600 text-white font-bold" : "text-neutral-700"
                                )}>
                                    {format(day, 'd')}
                                </div>

                                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                                    {dailyRes.map(res => (
                                        <div key={res.id} className={cn(
                                            "text-[10px] p-1 rounded border truncate flex flex-col",
                                            res.status === 'CONFIRMED' ? "bg-green-100 border-green-200 text-green-800" :
                                                res.status === 'COMPLETED' ? "bg-gray-100 border-gray-200 text-gray-800" :
                                                    "bg-red-50 border-red-100 text-red-800"
                                        )}>
                                            <span className="font-bold flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(res.startTime), 'HH:mm')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {res.member.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
