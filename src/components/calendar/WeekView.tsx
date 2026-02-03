'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { getWeekDays } from '@/lib/calendar-utils'
import { BookingModal } from './BookingModal'

interface Staff {
    id: string
    name: string
    color: string
}

interface Member {
    id: string
    name: string
    rank: string
}

interface Booking {
    id: string
    startTime: Date
    endTime: Date
    member: Member
    staff: Staff
    notes: string | null
}

interface WeekViewProps {
    date: Date
    staff: Staff[]
    bookings: Booking[]
    members: Member[]
}

export function WeekView({ date, staff, bookings, members }: WeekViewProps) {
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedStaffId, setSelectedStaffId] = useState('')
    const [selectedTime, setSelectedTime] = useState<Date>(new Date())

    const weekDays = getWeekDays(date)

    // Get bookings for specific staff and date
    const getBookingsForDay = (staffId: string, day: Date) => {
        const dayStr = format(day, 'yyyy-MM-dd')
        return bookings.filter(booking => {
            if (booking.staff.id !== staffId) return false
            const bookingDate = format(new Date(booking.startTime), 'yyyy-MM-dd')
            return bookingDate === dayStr
        })
    }

    // Handle cell click
    const handleCellClick = (staffId: string, day: Date) => {
        // Default to 10:00 AM
        const clickedTime = new Date(day)
        clickedTime.setHours(10, 0, 0, 0)

        setSelectedStaffId(staffId)
        setSelectedTime(clickedTime)
        setModalOpen(true)
    }

    const selectedStaff = staff.find(s => s.id === selectedStaffId)

    return (
        <div className="relative border rounded-lg overflow-hidden bg-white">
            {/* Header with Days */}
            <div className="grid gap-0 sticky top-0 bg-white z-10 border-b-2" style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}>
                <div className="border-r bg-slate-50 px-3 py-3 text-xs font-bold text-slate-600">
                    スタッフ
                </div>
                {weekDays.map(day => (
                    <div
                        key={day.toISOString()}
                        className="px-2 py-3 text-center border-r"
                    >
                        <div className="text-[10px] text-slate-500">{format(day, 'E', { locale: require('date-fns/locale/ja').ja })}</div>
                        <div className="text-sm font-bold">{format(day, 'M/d')}</div>
                    </div>
                ))}
            </div>

            {/* Staff Rows */}
            {staff.map(s => (
                <div
                    key={s.id}
                    className="grid gap-0"
                    style={{ gridTemplateColumns: `120px repeat(7, 1fr)`, minHeight: '100px' }}
                >
                    {/* Staff Name */}
                    <div
                        className="border-r border-b px-3 py-4 font-semibold text-sm flex items-center"
                        style={{ backgroundColor: `${s.color}10`, color: s.color }}
                    >
                        {s.name}
                    </div>

                    {/* Day Cells */}
                    {weekDays.map(day => {
                        const dayBookings = getBookingsForDay(s.id, day)
                        return (
                            <div
                                key={day.toISOString()}
                                className="border-r border-b p-2 cursor-pointer hover:bg-slate-50 transition-colors relative"
                                onClick={() => dayBookings.length === 0 && handleCellClick(s.id, day)}
                            >
                                {dayBookings.length > 0 ? (
                                    <div className="space-y-1">
                                        {dayBookings.map(booking => (
                                            <div
                                                key={booking.id}
                                                className="bg-green-500 text-white rounded px-2 py-1 text-[10px]"
                                            >
                                                <div className="font-bold truncate">{booking.member.name}</div>
                                                <div className="opacity-90">
                                                    {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-300 text-xs">
                                        空き
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ))}

            {/* Booking Modal */}
            {selectedStaff && (
                <BookingModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    staffId={selectedStaffId}
                    staffName={selectedStaff.name}
                    startTime={selectedTime}
                    members={members}
                />
            )}
        </div>
    )
}
