'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Clock, User } from 'lucide-react'

interface TimeSlot {
    staffId: string
    staffName: string
    time: Date
    available: boolean
}

interface TimeSlotPickerProps {
    date: Date
    slots: TimeSlot[]
    selectedSlot: TimeSlot | null
    onSelectSlot: (slot: TimeSlot) => void
}

export function TimeSlotPicker({ date, slots, selectedSlot, onSelectSlot }: TimeSlotPickerProps) {
    // Group slots by staff
    const slotsByStaff: Record<string, TimeSlot[]> = {}
    slots.forEach(slot => {
        if (!slotsByStaff[slot.staffId]) {
            slotsByStaff[slot.staffId] = []
        }
        slotsByStaff[slot.staffId].push(slot)
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Clock className="w-4 h-4 text-blue-500" />
                時間を選択
            </div>

            {Object.entries(slotsByStaff).map(([staffId, staffSlots]) => {
                const staffName = staffSlots[0]?.staffName
                const availableSlots = staffSlots.filter(s => s.available)

                if (availableSlots.length === 0) {
                    return null
                }

                return (
                    <div key={staffId} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                            <User className="w-3 h-3" />
                            {staffName}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {availableSlots.map((slot) => {
                                const isSelected = selectedSlot?.time.getTime() === slot.time.getTime() &&
                                    selectedSlot?.staffId === slot.staffId

                                return (
                                    <button
                                        key={slot.time.getTime()}
                                        onClick={() => onSelectSlot(slot)}
                                        className={`
                      py-2 px-3 rounded text-xs font-medium transition
                      ${isSelected
                                                ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                                                : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                                            }
                    `}
                                    >
                                        {format(slot.time, 'HH:mm')}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            })}

            {Object.values(slotsByStaff).every(slots => slots.every(s => !s.available)) && (
                <div className="text-center py-8 text-sm text-slate-400">
                    この日は予約がいっぱいです
                </div>
            )}
        </div>
    )
}
