import { startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, addWeeks, subWeeks, addMonths, subMonths, isSameDay, format } from 'date-fns'
import { ja } from 'date-fns/locale'

export type ViewType = 'day' | 'week' | 'month'

// Generate 15-minute time slots from 10:00 to 22:00
export function generate15MinSlots(): string[] {
    const slots: string[] = []
    for (let hour = 10; hour < 22; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            slots.push(formatTimeSlot(hour, minute))
        }
    }
    return slots
}

// Format time as HH:mm
export function formatTimeSlot(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

// Get week days starting from Monday
export function getWeekDays(date: Date): Date[] {
    const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday = 1
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

// Get month calendar grid with Monday start
export function getMonthCalendar(date: Date): Date[][] {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    // Start from Monday of the week containing the first day
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    // End at Sunday of the week containing the last day
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    // Group into weeks (7 days each)
    const weeks: Date[][] = []
    for (let i = 0; i < allDays.length; i += 7) {
        weeks.push(allDays.slice(i, i + 7))
    }

    return weeks
}

// Navigate to previous period based on view
export function navigatePrevious(date: Date, view: ViewType): Date {
    switch (view) {
        case 'day':
            return addDays(date, -1)
        case 'week':
            return subWeeks(date, 1)
        case 'month':
            return subMonths(date, 1)
    }
}

// Navigate to next period based on view
export function navigateNext(date: Date, view: ViewType): Date {
    switch (view) {
        case 'day':
            return addDays(date, 1)
        case 'week':
            return addWeeks(date, 1)
        case 'month':
            return addMonths(date, 1)
    }
}

// Format date range for header display
export function formatDateRange(date: Date, view: ViewType): string {
    switch (view) {
        case 'day':
            return format(date, 'yyyy年MM月dd日 (E)', { locale: ja })
        case 'week': {
            const weekDays = getWeekDays(date)
            const start = weekDays[0]
            const end = weekDays[6]
            if (start.getMonth() === end.getMonth()) {
                return `${format(start, 'yyyy年MM月dd日', { locale: ja })} - ${format(end, 'dd日', { locale: ja })}`
            }
            return `${format(start, 'yyyy年MM月dd日', { locale: ja })} - ${format(end, 'MM月dd日', { locale: ja })}`
        }
        case 'month':
            return format(date, 'yyyy年MM月', { locale: ja })
    }
}

// Check if date is in current month (for month view styling)
export function isInMonth(date: Date, currentMonth: Date): boolean {
    return date.getMonth() === currentMonth.getMonth() &&
        date.getFullYear() === currentMonth.getFullYear()
}

// Check if date is today
export function isToday(date: Date): boolean {
    return isSameDay(date, new Date())
}
