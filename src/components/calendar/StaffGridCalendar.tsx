'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { BookingModal } from './BookingModal'
import { BookingDetailModal } from './BookingDetailModal'

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

interface StaffGridCalendarProps {
    date: Date
    staff: Staff[]
    bookings: Booking[]
    members: Member[]
    serviceMenus: any[] // Using any for simplicity in props, ideally import ServiceMenu type
}

// Generate time slots from 10:00 to 22:00 in 15min intervals
function generateTimeSlots() {
    const slots = []
    for (let hour = 10; hour < 22; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
        }
    }
    return slots
}

export function StaffGridCalendar({ date, staff, bookings, members, serviceMenus }: StaffGridCalendarProps) {
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedStaffId, setSelectedStaffId] = useState('')
    const [selectedTime, setSelectedTime] = useState<Date>(new Date())
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

    const timeSlots = useMemo(() => generateTimeSlots(), [])

    // Get bookings for specific staff and time
    const getBookingForSlot = (staffId: string, timeSlot: string) => {
        const [hours, minutes] = timeSlot.split(':').map(Number)
        const slotTime = new Date(date)
        slotTime.setHours(hours, minutes, 0, 0)

        return bookings.find(booking => {
            if (booking.staff.id !== staffId) return false
            const start = new Date(booking.startTime)
            const end = new Date(booking.endTime)
            return slotTime >= start && slotTime < end
        })
    }

    // Check if this is the start of a booking block
    const isBookingStart = (booking: Booking, timeSlot: string) => {
        const [hours, minutes] = timeSlot.split(':').map(Number)
        const slotTime = new Date(date)
        slotTime.setHours(hours, minutes, 0, 0)
        const start = new Date(booking.startTime)
        return slotTime.getTime() === start.getTime()
    }

    // Calculate booking height (15min slots)
    const getBookingHeight = (booking: Booking) => {
        const start = new Date(booking.startTime)
        const end = new Date(booking.endTime)
        const durationMin = (end.getTime() - start.getTime()) / (1000 * 60)
        const slots = durationMin / 15
        return `${slots * 30}px` // 30px per 15min slot
    }

    // Handle empty cell click
    const handleCellClick = (staffId: string, timeSlot: string) => {
        const [hours, minutes] = timeSlot.split(':').map(Number)
        const clickedTime = new Date(date)
        clickedTime.setHours(hours, minutes, 0, 0)

        setSelectedStaffId(staffId)
        setSelectedTime(clickedTime)
        setModalOpen(true)
    }

    // Handle booking click
    const handleBookingClick = (booking: Booking) => {
        setSelectedBooking(booking)
        setDetailModalOpen(true)
    }

    // Get current time indicator position
    const getCurrentTimePosition = () => {
        const now = new Date()
        if (format(now, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')) return null

        const hours = now.getHours()
        const minutes = now.getMinutes()

        if (hours < 10 || hours >= 22) return null

        const totalMinutes = (hours - 10) * 60 + minutes
        const position = (totalMinutes / 15) * 30 // 30px per 15min slot
        return position
    }

    const currentTimePosition = getCurrentTimePosition()
    const selectedStaff = staff.find(s => s.id === selectedStaffId)

    return (
        <div className="relative">
            {/* Header with Staff Names */}
            <div className="grid gap-0 sticky top-0 bg-white z-10 border-b-2" style={{ gridTemplateColumns: `80px repeat(${staff.length}, 1fr)` }}>
                <div className="border-r bg-slate-50 px-2 py-3 text-xs font-bold text-slate-600">
                    時間
                </div>
                {staff.map(s => (
                    <div
                        key={s.id}
                        className="px-4 py-3 text-center font-bold text-sm border-r"
                        style={{ backgroundColor: `${s.color}10`, color: s.color }}
                    >
                        {s.name}
                    </div>
                ))}
            </div>

            {/* Time Grid */}
            <div className="relative">
                {timeSlots.map((timeSlot, rowIndex) => (
                    <div
                        key={timeSlot}
                        className="grid gap-0"
                        style={{ gridTemplateColumns: `80px repeat(${staff.length}, 1fr)`, height: '30px' }}
                    >
                        {/* Time Label */}
                        <div className="border-r border-b bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600 font-medium flex items-center">
                            {timeSlot}
                        </div>

                        {/* Staff Columns */}
                        {staff.map(s => {
                            const booking = getBookingForSlot(s.id, timeSlot)
                            const isStart = booking && isBookingStart(booking, timeSlot)

                            return (
                                <div
                                    key={s.id}
                                    className="border-r border-b relative"
                                    onClick={() => !booking && handleCellClick(s.id, timeSlot)}
                                >
                                    {/* Booking Block */}
                                    {isStart && booking && (
                                        <div
                                            className="absolute inset-0 bg-green-500 text-white p-1 overflow-hidden cursor-pointer hover:bg-green-600 transition-colors z-10"
                                            style={{
                                                height: getBookingHeight(booking),
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleBookingClick(booking)
                                            }}
                                        >
                                            <div className="text-[10px] font-bold">{booking.member.name}様</div>
                                            <div className="text-[9px] opacity-90">
                                                {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                                            </div>
                                            {booking.notes && (
                                                <div className="text-[8px] opacity-75 mt-0.5 truncate">{booking.notes}</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Empty Slot */}
                                    {!booking && (
                                        <div className="h-full flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                                            <span className="text-slate-300 text-[10px]">ー</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ))}

                {/* Current Time Red Line */}
                {currentTimePosition !== null && (
                    <div
                        className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                        style={{ top: `${currentTimePosition + 49}px` }}
                    >
                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {selectedStaff && (
                <BookingModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    staffId={selectedStaffId}
                    staffName={selectedStaff.name}
                    startTime={selectedTime}
                    members={members}
                    serviceMenus={serviceMenus}
                />
            )}

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    open={detailModalOpen}
                    onClose={() => {
                        setDetailModalOpen(false)
                        setSelectedBooking(null)
                    }}
                />
            )}
        </div>
    )
}
