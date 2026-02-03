'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { startOfDay, startOfMonth, endOfMonth, isAfter, addDays, getDaysInMonth, addHours, isBefore } from 'date-fns'
import { MEMBER_PLANS, getPlanFromId } from '@/lib/constants'

// 会員情報を取得（仮：emailから）
export async function getCurrentMember(email: string) {
    try {
        const user = await prisma.user.findFirst({
            where: { email },
            include: {
                memberProfile: {
                    include: {
                        mainTrainer: true,
                        bookings: {
                            where: {
                                status: { not: 'cancelled' }
                            },
                            orderBy: {
                                startTime: 'asc'
                            }
                        }
                    }
                }
            }
        })

        if (!user || !user.memberProfile) {
            return { error: '会員情報が見つかりません' }
        }

        return { member: user.memberProfile }
    } catch (error) {
        console.error('Error fetching member:', error)
        return { error: '会員情報の取得に失敗しました' }
    }
}

// 会員の予約一覧を取得
export async function getMemberBookings(memberId: string) {
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                memberId,
                status: {
                    notIn: ['CANCELLED', 'cancelled', 'cancelled_late']
                }
            },
            include: {
                staff: true,
                member: true
            },
            orderBy: {
                startTime: 'asc'
            }
        })

        return { bookings }
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return { error: '予約情報の取得に失敗しました' }
    }
}

// 会員が予約を作成（契約回数チェック含む）
export async function createMemberBooking(data: {
    memberId: string
    staffId: string
    startTime: Date
    duration: number
    notes?: string
    type?: string
}) {
    try {
        const { memberId, staffId, startTime, duration, notes, type } = data
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

        // 会員情報を取得して契約回数を確認
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: {
                bookings: {
                    where: {
                        status: { not: 'cancelled' },
                        startTime: {
                            gte: new Date(startTime.getFullYear(), startTime.getMonth(), 1),
                            lt: new Date(startTime.getFullYear(), startTime.getMonth() + 1, 1)
                        }
                    }
                }
            }
        })

        if (!member) {
            return { error: '会員が見つかりません' }
        }

        // 予約期限チェック (プラン制限)
        const plan = getPlanFromId(member.plan || 'STANDARD')
        const maxAllowedDate = addDays(startOfDay(new Date()), plan.limitDays + 1)

        if (isAfter(startTime, maxAllowedDate)) {
            return { error: `現在のプランでは${plan.limitDays}日先までしか予約できません` }
        }

        // 24時間前ルールチェック
        // 予約希望時間の24時間前を過ぎている場合は予約不可
        // つまり、予約日時が「現在＋24時間」よりも前なら不可
        const minAllowedTime = addHours(new Date(), 24)
        if (isBefore(startTime, minAllowedTime)) {
            return { error: '予約は希望時間の24時間前までにお願いします' }
        }

        const currentMonthBookings = member.bookings.length
        const isOverLimit = currentMonthBookings >= member.contractedSessions

        // 重複チェック
        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                staffId,
                status: { not: 'CANCELLED' },
                OR: [
                    {
                        AND: [
                            { startTime: { lte: startTime } },
                            { endTime: { gt: startTime } }
                        ]
                    },
                    {
                        AND: [
                            { startTime: { lt: endTime } },
                            { endTime: { gte: endTime } }
                        ]
                    },
                    {
                        AND: [
                            { startTime: { gte: startTime } },
                            { endTime: { lte: endTime } }
                        ]
                    }
                ]
            }
        })

        if (conflictingBooking) {
            return { error: 'この時間帯は既に予約されています' }
        }

        // 予約作成
        const booking = await prisma.booking.create({
            data: {
                memberId,
                staffId,
                startTime,
                endTime,
                type: type || 'REGULAR',
                notes: notes || null,
                status: 'CONFIRMED'
            },
            include: {
                staff: true,
                member: true
            }
        })

        revalidatePath('/member-app/booking')
        revalidatePath('/dashboard/calendar')

        return {
            booking,
            isOverLimit,
            message: '予約が完了しました。'
        }
    } catch (error) {
        console.error('Error creating booking:', error)
        return { error: '予約の作成に失敗しました' }
    }
}

// 会員が予約をキャンセル
export async function cancelMemberBooking(bookingId: string, memberId: string, reason?: string) {
    try {
        // 予約が会員のものか確認
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        if (!booking || booking.memberId !== memberId) {
            return { error: '予約が見つかりません' }
        }

        if (booking.status === 'cancelled' || booking.status === 'cancelled_late') {
            return { error: 'この予約は既にキャンセルされています' }
        }

        // Check if cancellation is more than 24 hours before the booking
        const now = new Date()
        const hoursUntilBooking = (booking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

        // 24 hours or more before: 'cancelled' (not counted)
        // Less than 24 hours: 'cancelled_late' (counted)
        let status = hoursUntilBooking >= 24 ? 'cancelled' : 'cancelled_late'
        let isRelieved = false

        // 救済ロジック（24時間以内かつ特定理由の場合）
        if (status === 'cancelled_late' && (reason === 'SICKNESS' || reason === 'BEREAVEMENT')) {
            const startOfCurrentMonth = startOfMonth(now)
            const endOfCurrentMonth = endOfMonth(now)

            // 当月の救済履歴を確認（statusがcancelledかつ、対象理由のもの）
            const existingRelief = await prisma.booking.findFirst({
                where: {
                    memberId,
                    status: 'cancelled', // 救済されたものは消化なし
                    cancellationReason: {
                        in: ['SICKNESS', 'BEREAVEMENT'] // 体調不良または不幸ごと
                    },
                    updatedAt: { // キャンセル日時（簡易的に更新日時を使用）
                        gte: startOfCurrentMonth,
                        lte: endOfCurrentMonth
                    }
                }
            })

            // 今月まだ救済されていなければ救済
            if (!existingRelief) {
                status = 'cancelled'
                isRelieved = true
            }
        }

        // キャンセル
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status,
                cancellationReason: reason || (status === 'cancelled' ? 'NORMAL' : 'OTHER')
            }
        })

        revalidatePath('/member-app/booking')
        revalidatePath('/dashboard/calendar')

        let message = '予約をキャンセルしました'
        if (isRelieved) {
            message = '予約をキャンセルしました（今月1回目のため、特別にお振替可能としました）'
        } else if (status === 'cancelled_late') {
            message = '予約をキャンセルしました（24時間以内のため、1回分消化となります）'
        }

        return { message, status }
    } catch (error) {
        console.error('Error cancelling booking:', error)
        return { error: '予約のキャンセルに失敗しました' }
    }
}
