'use client'

import { useState } from 'react'
import { format, isSameMonth, startOfDay, addDays } from 'date-fns'
import { Check, AlertCircle } from 'lucide-react'
import { WeeklyBookingGrid } from '@/components/member/WeeklyBookingGrid'
import { BookingConfirmModal } from '@/components/member/BookingConfirmModal'
import { MyBookingsList } from '@/components/member/MyBookingsList'
import { createMemberBooking, cancelMemberBooking } from '@/app/actions/member_actions'
import { TRAINER_RATES } from '@/lib/billing'
import { getPlanFromId } from '@/lib/constants'

interface MemberProfile {
    id: string
    name: string
    rank: string
    contractedSessions: number
    mainTrainer: { name: string } | null
    plan?: string
}

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

interface MemberBookingClientProps {
    member: MemberProfile
    bookings: Booking[]
}

export function MemberBookingClient({ member, bookings: initialBookings }: MemberBookingClientProps) {
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date, time: string } | null>(null)
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bookings, setBookings] = useState(initialBookings)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Calculate usage
    const currentMonthBookings = bookings.filter(b =>
        b.status !== 'cancelled' && // 24時間前のキャンセルのみ除外（'cancelled_late'は含む）
        isSameMonth(new Date(b.startTime), new Date())
    )
    const usageCount = currentMonthBookings.length
    const contractLimit = member.contractedSessions
    const isOverLimit = usageCount >= contractLimit

    const trainerName = member.mainTrainer?.name || '夏井 優志'
    const extraFee = TRAINER_RATES[trainerName] || 5000

    // 予約可能期限の計算
    const plan = getPlanFromId(member.plan || 'STANDARD')
    const maxAllowedDate = addDays(startOfDay(new Date()), plan.limitDays)

    const handleSlotSelect = (date: Date, time: string) => {
        setSelectedDateTime({ date, time })
        setConfirmModalOpen(true)
    }

    const handleConfirmBooking = async (notes?: string, type?: string) => {
        if (!selectedDateTime) return

        setIsSubmitting(true)
        try {
            // 選択された日時を組み合わせる
            const [hours, minutes] = selectedDateTime.time.split(':').map(Number)
            const startTime = new Date(selectedDateTime.date)
            startTime.setHours(hours, minutes, 0, 0)

            const result = await createMemberBooking({
                memberId: member.id,
                staffId: member.mainTrainer?.name === '夏井 莉沙' ? 'staff-2' : 'staff-1', // 仮のスタッフID
                startTime,
                duration: 60,
                notes: notes || '',
                type
            })

            if (result.error) {
                setMessage({ type: 'error', text: result.error })
            } else {
                setMessage({
                    type: 'success',
                    text: result.message || '予約が完了しました'
                })
                setConfirmModalOpen(false)
                setSelectedDateTime(null)

                // Add booking to list if successful
                if (result.booking) {
                    setBookings(prev => [...prev, {
                        ...result.booking,
                        startTime: new Date(result.booking.startTime),
                        endTime: new Date(result.booking.endTime)
                    }])
                }

                // Scroll to top to show message
                window.scrollTo({ top: 0, behavior: 'smooth' })

                // Clear message after 5 seconds
                setTimeout(() => setMessage(null), 5000)
            }
        } catch (error) {
            console.error('Error creating booking:', error)
            setMessage({ type: 'error', text: '予約の作成に失敗しました' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancelBooking = async (bookingId: string, reason?: string) => {
        try {
            const result = await cancelMemberBooking(bookingId, member.id, reason)

            if (result.error) {
                setMessage({ type: 'error', text: result.error })
            } else {
                setMessage({ type: 'success', text: result.message || '予約をキャンセルしました' })
                setBookings(prev => prev.filter(b => b.id !== bookingId))

                // Clear message after 5 seconds
                setTimeout(() => setMessage(null), 5000)
            }
        } catch (error) {
            console.error('Error cancelling booking:', error)
            setMessage({ type: 'error', text: '予約のキャンセルに失敗しました' })
        }
    }

    return (
        <div className="bg-white min-h-screen pb-24">
            <header className="bg-white p-4 sticky top-0 z-30 shadow-sm">
                <h1 className="font-bold text-lg">トレーニング予約</h1>
                <div className="text-xs text-slate-500">
                    {member.name}様 ({member.rank})
                </div>
            </header>

            <div className="p-4 space-y-4">
                {/* Success/Error Message */}
                {message && (
                    <div className={`p-3 rounded-lg flex items-start gap-2 ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                        }`}>
                        {message.type === 'success' ? (
                            <Check className="w-5 h-5 text-green-500 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                        <div className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    </div>
                )}

                {/* Status Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-600">今月の利用状況</span>
                        <span className={`text-sm font-bold ${isOverLimit ? 'text-orange-500' : 'text-blue-600'}`}>
                            {usageCount} / {contractLimit}回
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${isOverLimit ? 'bg-orange-400' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min((usageCount / contractLimit) * 100, 100)}%` }}
                        />
                    </div>
                    {isOverLimit && (
                        <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                            今月の契約回数に達しています。
                        </div>
                    )}
                </div>

                {/* My Bookings */}
                <div>
                    <h2 className="text-sm font-bold mb-3">予約一覧</h2>
                    <MyBookingsList bookings={bookings} onCancel={handleCancelBooking} />
                </div>

                {/* Weekly Calendar */}
                <div>
                    <h2 className="text-sm font-bold mb-3">新規予約</h2>
                    <WeeklyBookingGrid
                        bookings={bookings}
                        onSelectSlot={handleSlotSelect}
                        maxAllowedDate={maxAllowedDate}
                    />
                </div>
            </div>

            {/* Confirm Modal */}
            <BookingConfirmModal
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                bookingData={selectedDateTime ? {
                    date: selectedDateTime.date,
                    time: (() => {
                        const [hours, minutes] = selectedDateTime.time.split(':').map(Number)
                        const d = new Date(selectedDateTime.date)
                        d.setHours(hours, minutes, 0, 0)
                        return d
                    })(),
                    staffId: '', // スタッフ指定なし
                    staffName: '指名なし', // 仮
                    duration: 60
                } : null}
                isOverLimit={isOverLimit}
                extraFee={5500} // 仮の追加料金
                onConfirm={handleConfirmBooking}
                memberPlanId={member.plan || 'STANDARD'}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
