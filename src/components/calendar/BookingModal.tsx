'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createBooking } from '@/app/actions/calendar_actions'
import { format } from 'date-fns'

interface BookingModalProps {
    open: boolean
    onClose: () => void
    staffId: string
    staffName: string
    startTime: Date
    members: Array<{ id: string; name: string; rank: string }>
}

export function BookingModal({
    open,
    onClose,
    staffId,
    staffName,
    startTime,
    members
}: BookingModalProps) {
    const [selectedMemberId, setSelectedMemberId] = useState('')
    const [duration, setDuration] = useState(60)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (!selectedMemberId) {
            setError('メンバーを選択してください')
            return
        }

        setLoading(true)
        setError('')

        try {
            const endTime = new Date(startTime)
            endTime.setMinutes(endTime.getMinutes() + duration)

            await createBooking({
                memberId: selectedMemberId,
                staffId,
                startTime,
                endTime,
                notes: notes || undefined
            })

            // Reset and close
            setSelectedMemberId('')
            setDuration(60)
            setNotes('')
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : '予約の作成に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>新規予約</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Staff (Auto-filled) */}
                    <div>
                        <Label className="text-sm font-bold text-slate-600">担当スタッフ</Label>
                        <div className="mt-1 px-3 py-2 bg-slate-100 rounded text-sm">
                            {staffName}
                        </div>
                    </div>

                    {/* Start Time (Auto-filled) */}
                    <div>
                        <Label className="text-sm font-bold text-slate-600">開始時刻</Label>
                        <div className="mt-1 px-3 py-2 bg-slate-100 rounded text-sm">
                            {format(startTime, 'yyyy/MM/dd HH:mm')}
                        </div>
                    </div>

                    {/* Member Selection */}
                    <div>
                        <Label className="text-sm font-bold text-slate-600">顧客</Label>
                        <select
                            value={selectedMemberId}
                            onChange={(e) => setSelectedMemberId(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">メンバーを選択してください</option>
                            {members.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.name} ({member.rank})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Duration */}
                    <div>
                        <Label className="text-sm font-bold text-slate-600">セッション時間</Label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="mt-1 w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={30}>30分</option>
                            <option value={60}>60分</option>
                            <option value={90}>90分</option>
                            <option value={120}>120分</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label className="text-sm font-bold text-slate-600">備考（任意）</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="目的、要望など..."
                            className="mt-1 min-h-[60px] text-sm"
                            rows={2}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {loading ? '登録中...' : '予約確定'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
