'use client'

import { useState } from 'react'
import { format, isAfter, isPast, isSameMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, Clock, User, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CancellationConfirmModal } from '@/components/member/CancellationConfirmModal'

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

interface MyBookingsListProps {
    bookings: Booking[]
    onCancel: (bookingId: string, reason?: string) => Promise<void>
}

export function MyBookingsList({ bookings, onCancel }: MyBookingsListProps) {
    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
    const [isLateCancellation, setIsLateCancellation] = useState(false)

    // Filter and sort bookings for current month (exclude all cancelled bookings)
    const currentMonthBookings = bookings.filter(b =>
        b.status !== 'cancelled' &&
        b.status !== 'cancelled_late' &&
        isSameMonth(new Date(b.startTime), new Date())
    )

    // Sort: past bookings first (oldest to newest), then future bookings (earliest to latest)
    const sortedBookings = currentMonthBookings.sort((a, b) => {
        const aPast = isPast(a.endTime)
        const bPast = isPast(b.endTime)

        // If both past or both future, sort by startTime
        if (aPast === bPast) {
            return a.startTime.getTime() - b.startTime.getTime()
        }

        // Past bookings come first
        return aPast ? 1 : -1
    })

    const handleCancelClick = (bookingId: string, startTime: Date) => {
        const now = new Date()
        const hoursUntilBooking = (new Date(startTime).getTime() - now.getTime()) / (1000 * 60 * 60)

        setIsLateCancellation(hoursUntilBooking < 24)
        setSelectedBookingId(bookingId)
        setCancelModalOpen(true)
    }

    const handleConfirmCancel = async (reason?: string) => {
        if (!selectedBookingId) return

        setCancellingId(selectedBookingId)
        try {
            await onCancel(selectedBookingId, reason)
        } finally {
            setCancellingId(null)
            setCancelModalOpen(false)
            setSelectedBookingId(null)
        }
    }

    if (sortedBookings.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
                <div className="text-sm text-slate-400">今月の予約はありません</div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {sortedBookings.map((booking) => {
                const isCompleted = isPast(booking.endTime)
                const isFuture = isAfter(booking.startTime, new Date())

                return (
                    <div
                        key={booking.id}
                        className={`bg-white p-4 rounded-xl shadow-sm border ${isCompleted
                            ? 'border-slate-200 bg-slate-50'
                            : 'border-slate-100'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className={`w-4 h-4 ${isCompleted ? 'text-slate-400' : 'text-blue-500'}`} />
                                        <span className={`font-medium ${isCompleted ? 'text-slate-500' : ''}`}>
                                            {format(booking.startTime, 'M月d日 (E)', { locale: ja })}
                                        </span>
                                    </div>
                                    {isCompleted && (
                                        <div className="flex items-center gap-1 text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                            <CheckCircle className="w-3 h-3" />
                                            完了
                                        </div>
                                    )}
                                </div>

                                <div className={`flex items-center gap-2 text-sm ${isCompleted ? 'text-slate-500' : 'text-slate-600'}`}>
                                    <Clock className="w-4 h-4" />
                                    <span>
                                        {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                                    </span>
                                </div>

                                <div className={`flex items-center gap-2 text-sm ${isCompleted ? 'text-slate-500' : 'text-slate-600'}`}>
                                    <User className="w-4 h-4" />
                                    <span>{booking.staff.name}</span>
                                </div>
                            </div>

                            {isFuture && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelClick(booking.id, booking.startTime)}
                                    disabled={cancellingId === booking.id}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    {cancellingId === booking.id ? (
                                        '処理中...'
                                    ) : (
                                        <>
                                            <X className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                )
            })}

            <CancellationConfirmModal
                open={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                isLateCancellation={isLateCancellation}
                isSubmitting={!!cancellingId}
            />
        </div>
    )
}
