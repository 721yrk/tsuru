'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, Info, Loader2 } from 'lucide-react'

interface CancellationConfirmModalProps {
    open: boolean
    onClose: () => void
    onConfirm: (reason?: string) => Promise<void>
    isLateCancellation: boolean
    isSubmitting: boolean
}

const CANCELLATION_REASONS = [
    { id: 'SICKNESS', label: '体調不良' },
    { id: 'REST', label: '休養のため' },
    { id: 'BEREAVEMENT', label: '不幸ごとのため' },
    { id: 'OTHER', label: 'その他' },
] as const

export function CancellationConfirmModal({
    open,
    onClose,
    onConfirm,
    isLateCancellation,
    isSubmitting
}: CancellationConfirmModalProps) {
    const [reason, setReason] = useState<string>('')

    const handleConfirm = async () => {
        if (isLateCancellation && !reason) return
        await onConfirm(reason || undefined)
        setReason('')
        onClose()
    }

    const showReliefNote = reason === 'SICKNESS' || reason === 'BEREAVEMENT'
    const selectedReasonLabel = CANCELLATION_REASONS.find(r => r.id === reason)?.label

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isLateCancellation && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                        予約キャンセルの確認
                    </DialogTitle>
                    <DialogDescription>
                        この予約をキャンセルしてもよろしいですか？
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {isLateCancellation ? (
                        <div className="space-y-4">
                            <div className="bg-amber-50 p-3 rounded-md text-sm text-amber-800 border border-amber-200">
                                予約時間の24時間を切っているため、原則として1回分消化となります。
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">キャンセル理由 <span className="text-red-500">*</span></Label>
                                <Select value={reason} onValueChange={setReason}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="理由を選択してください" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CANCELLATION_REASONS.map((r) => (
                                            <SelectItem key={r.id} value={r.id}>
                                                {r.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {showReliefNote && (
                                <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-md text-sm text-blue-700 border border-blue-200">
                                    <Info className="h-5 w-5 shrink-0 mt-0.5" />
                                    <div>
                                        「{selectedReasonLabel}」の場合、当月1回目に限り、特別にお振替可能（消化なし）となる場合があります。
                                        <div className="text-xs text-blue-500 mt-1">※自動判定されます</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">
                            予約時間の24時間前までのキャンセルのため、チケットは消化されません。
                        </p>
                    )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        戻る
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isSubmitting || (isLateCancellation && !reason)}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                処理中...
                            </>
                        ) : (
                            'キャンセルする'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
