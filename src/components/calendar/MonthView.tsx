'use client'

import { getMonthCalendar, isInMonth, isToday } from '@/lib/calendar-utils'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'

interface Booking {
    id: string
    startTime: Date
    endTime: Date
}

interface MonthViewProps {
    date: Date
    bookings: Booking[]
}

export function MonthView({ date, bookings }: MonthViewProps) {
    const weeks = getMonthCalendar(date)

    // Get booking count for a specific date
    const getBookingCount = (day: Date) => {
        const dayStr = format(day, 'yyyy-MM-dd')
        return bookings.filter(booking => {
            const bookingDate = format(new Date(booking.startTime), 'yyyy-MM-dd')
            return bookingDate === dayStr
        }).length
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-white">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b bg-slate-50">
                {['月', '火', '水', '木', '金', '土', '日'].map((day, idx) => (
                    <div
                        key={idx}
                        className="px-2 py-3 text-center text-xs font-bold text-slate-600 border-r last:border-r-0"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7">
                    {week.map((day, dayIdx) => {
                        const inMonth = isInMonth(day, date)
                        const today = isToday(day)
                        const bookingCount = getBookingCount(day)
                        const dateStr = format(day, 'yyyy-MM-dd')

                        return (
                            <Link
                                key={dayIdx}
                                href={`/dashboard/calendar?date=${dateStr}&view=day`}
                                className={`
                  min-h-[80px] p-2 border-r border-b last:border-r-0
                  hover:bg-slate-50 transition-colors cursor-pointer
                  ${!inMonth ? 'bg-slate-50 text-slate-400' : ''}
                  ${today ? 'bg-blue-50' : ''}
                `}
                            >
                                <div className="flex flex-col h-full">
                                    <div className={`
                    text-sm font-medium mb-1
                    ${today ? 'text-blue-600 font-bold' : ''}
                  `}>
                                        {format(day, 'd')}
                                    </div>
                                    {bookingCount > 0 && (
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                                                {bookingCount}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}
