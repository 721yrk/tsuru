'use client'

import { useState, useMemo } from 'react'
import { format, addDays, startOfWeek, isSameDay, isAfter, startOfDay, addWeeks, subWeeks, addHours, isBefore } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Booking {
    id: string
    startTime: Date
    endTime: Date
    staff: {
        id: string
        name: string
        color: string
    }
    status: string
}


interface WeeklyBookingGridProps {
    bookings: Booking[]
    onSelectSlot: (date: Date, time: string) => void
    maxAllowedDate?: Date // 予約可能な最終日
}

// 営業時間（10:00-21:00を15分刻み）
const generateTimeSlots = () => {
    const slots: string[] = []
    for (let hour = 10; hour <= 20; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            slots.push(timeStr)
        }
    }
    slots.push('21:00')
    return slots
}

export function WeeklyBookingGrid({ bookings, onSelectSlot, maxAllowedDate }: WeeklyBookingGridProps) {
    const [currentWeekStart, setCurrentWeekStart] = useState(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 }) // 月曜始まり
    )

    const timeSlots = useMemo(() => generateTimeSlots(), [])

    // 週の7日間を生成
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) =>
            addDays(currentWeekStart, i)
        )
    }, [currentWeekStart])

    // 空き状況マップを作成
    const availabilityMap = useMemo(() => {
        const map = new Map<string, boolean>() // key: "YYYY-MM-DD-HH:mm", value: true=予約済み

        bookings.forEach(booking => {
            const startTime = new Date(booking.startTime)
            const endTime = new Date(booking.endTime)
            const dateKey = format(startTime, 'yyyy-MM-dd')

            // 予約の開始時刻から終了時刻までの全時間帯をマーク
            const startHour = startTime.getHours()
            const startMinute = startTime.getMinutes()
            const endHour = endTime.getHours()
            const endMinute = endTime.getMinutes()

            timeSlots.forEach(slot => {
                const [slotHour, slotMinute] = slot.split(':').map(Number)

                // このスロットが予約時間内に含まれるかチェック
                const slotTime = slotHour * 60 + slotMinute
                const bookingStartTime = startHour * 60 + startMinute
                const bookingEndTime = endHour * 60 + endMinute

                if (slotTime >= bookingStartTime && slotTime < bookingEndTime) {
                    const key = `${dateKey}-${slot}`
                    map.set(key, true)
                }
            })
        })

        return map
    }, [bookings, timeSlots])

    const handlePrevWeek = () => {
        setCurrentWeekStart(prev => subWeeks(prev, 1))
    }

    const handleNextWeek = () => {
        setCurrentWeekStart(prev => addWeeks(prev, 1))
    }

    const handleToday = () => {
        setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
    }

    const handleSlotClick = (day: Date, time: string) => {
        const key = `${format(day, 'yyyy-MM-dd')}-${time}`
        const isBooked = availabilityMap.get(key)

        // 過去の日付はクリック不可
        if (!isAfter(startOfDay(day), startOfDay(new Date())) && !isSameDay(day, new Date())) {
            return
        }

        // 予約期限チェック
        if (maxAllowedDate && isAfter(startOfDay(day), startOfDay(maxAllowedDate))) {
            return
        }

        // 予約済みはクリック不可
        if (isBooked) {
            return
        }

        // 24時間前ルール（現在時刻から24時間以内の枠は予約不可）
        const [hour, minute] = time.split(':').map(Number)
        const slotDate = new Date(day)
        slotDate.setHours(hour, minute, 0, 0)

        if (isBefore(slotDate, addHours(new Date(), 24))) {
            return
        }

        onSelectSlot(day, time)
    }

    const today = new Date()

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            {/* ナビゲーション */}
            <div className="flex items-center justify-between p-4 border-b">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevWeek}
                    className="gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    前週
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                >
                    今週
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextWeek}
                    className="gap-1"
                >
                    次週
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            {/* 週間グリッド */}
            <div className="relative">
                {/* 日付ヘッダー（sticky） */}
                <div className="sticky top-0 bg-white z-20 border-b shadow-sm">
                    <div className="grid grid-cols-8">
                        <div className="p-3 text-xs font-bold text-slate-600 bg-slate-50 border-r">
                            時間
                        </div>
                        {weekDays.map(day => {
                            const isToday = isSameDay(day, today)
                            const isPast = !isAfter(day, startOfDay(today)) && !isSameDay(day, today)
                            const isTooFar = maxAllowedDate && isAfter(startOfDay(day), startOfDay(maxAllowedDate))

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`p-3 text-center border-r last:border-r-0 ${isToday ? 'bg-blue-50' : isPast || isTooFar ? 'bg-slate-50' : ''
                                        }`}
                                >
                                    <div className={`font-bold text-sm ${isToday ? 'text-blue-600' : isPast || isTooFar ? 'text-slate-400' : 'text-slate-800'
                                        }`}>
                                        {format(day, 'M/d')}
                                    </div>
                                    <div className={`text-xs ${isToday ? 'text-blue-500' : isPast || isTooFar ? 'text-slate-400' : 'text-slate-500'
                                        }`}>
                                        {format(day, '(E)', { locale: ja })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* 時間帯グリッド（スクロール可能） */}
                <div className="max-h-96 overflow-y-auto">
                    {timeSlots.map((time, idx) => (
                        <div
                            key={time}
                            className={`grid grid-cols-8 border-b last:border-b-0 hover:bg-slate-50 ${idx % 4 === 0 ? 'border-t-2' : ''
                                }`}
                        >
                            <div className="p-3 text-xs font-medium text-slate-600 bg-slate-50 border-r">
                                {time}
                            </div>
                            {weekDays.map(day => {
                                const key = `${format(day, 'yyyy-MM-dd')}-${time}`
                                const isBooked = availabilityMap.get(key)
                                const isPast = !isAfter(day, startOfDay(today)) && !isSameDay(day, today)
                                const isTooFar = maxAllowedDate && isAfter(startOfDay(day), startOfDay(maxAllowedDate))

                                // 24時間前ルールチェック
                                const [hour, minute] = time.split(':').map(Number)
                                const slotDate = new Date(day)
                                slotDate.setHours(hour, minute, 0, 0)
                                const isWithin24Hours = isBefore(slotDate, addHours(new Date(), 24))

                                const isClickable = !isBooked && !isPast && !isTooFar && !isWithin24Hours

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleSlotClick(day, time)}
                                        disabled={!isClickable}
                                        className={`p-3 text-center border-r last:border-r-0 transition-colors ${isClickable
                                            ? 'hover:bg-blue-100 cursor-pointer'
                                            : 'cursor-not-allowed'
                                            } ${isPast || isTooFar || isWithin24Hours ? 'bg-slate-50' : ''}`}
                                    >
                                        <span className={`text-lg font-bold ${isBooked ? 'text-red-500' : isPast || isTooFar || isWithin24Hours ? 'text-slate-300' : 'text-green-500'
                                            }`}>
                                            {isBooked ? '×' : (isTooFar || isWithin24Hours ? '-' : '○')}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* 凡例 */}
            <div className="p-4 border-t bg-slate-50 flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-500">○</span>
                    <span className="text-slate-600">空きあり</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-500">×</span>
                    <span className="text-slate-600">予約済み</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-300">-</span>
                    <span className="text-slate-600">予約不可</span>
                </div>
            </div>
        </div>
    )
}
