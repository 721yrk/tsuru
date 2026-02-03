import { getStaffList, getBookingsForDate, getMembersList } from '@/app/actions/calendar_actions'
import { StaffGridCalendar } from '@/components/calendar/StaffGridCalendar'
import { WeekView } from '@/components/calendar/WeekView'
import { MonthView } from '@/components/calendar/MonthView'
import { ViewSwitcher } from '@/components/calendar/ViewSwitcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import {
    ViewType,
    formatDateRange,
    navigatePrevious,
    navigateNext,
    getWeekDays
} from '@/lib/calendar-utils'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: { date?: string; view?: string }
}

export default async function CalendarPage({ searchParams }: PageProps) {
    // Await searchParams (Next.js 15 requirement)
    const params = await searchParams

    // Get selected date or default to today
    const selectedDate = params.date
        ? new Date(params.date)
        : new Date()

    // Ensure time is set to start of day
    selectedDate.setHours(0, 0, 0, 0)

    // Get view type (default to day)
    const view = (params.view as ViewType) || 'day'

    // Fetch data based on view
    let bookings
    if (view === 'day') {
        bookings = await getBookingsForDate(selectedDate)
    } else if (view === 'week') {
        // Get bookings for entire week
        const weekDays = getWeekDays(selectedDate)
        const weekStart = weekDays[0]
        const weekEnd = weekDays[6]
        weekEnd.setHours(23, 59, 59, 999)

        const allBookings = await Promise.all(
            weekDays.map(day => getBookingsForDate(day))
        )
        bookings = allBookings.flat()
    } else {
        // Month view - get all bookings for the month
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
        monthEnd.setHours(23, 59, 59, 999)

        // Get bookings for each day in month (simplification)
        const daysInMonth = monthEnd.getDate()
        const allBookings = await Promise.all(
            Array.from({ length: daysInMonth }, (_, i) => {
                const day = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1)
                return getBookingsForDate(day)
            })
        )
        bookings = allBookings.flat()
    }

    const [staff, members] = await Promise.all([
        getStaffList(),
        getMembersList()
    ])

    // Convert Date objects for client component
    const bookingsWithDates = bookings.map(booking => ({
        ...booking,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime)
    }))

    // Navigation
    const prevDate = navigatePrevious(selectedDate, view)
    const nextDate = navigateNext(selectedDate, view)
    const prevUrl = `/dashboard/calendar?date=${format(prevDate, 'yyyy-MM-dd')}&view=${view}`
    const nextUrl = `/dashboard/calendar?date=${format(nextDate, 'yyyy-MM-dd')}&view=${view}`
    const todayUrl = `/dashboard/calendar?date=${format(new Date(), 'yyyy-MM-dd')}&view=${view}`

    return (
        <div className="p-4 md:p-8 space-y-6 bg-neutral-50 min-h-screen">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-neutral-900">予約カレンダー</h2>
                <p className="text-neutral-500">Reservation Calendar</p>
            </div>

            {/* Main Calendar Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Date Display */}
                        <CardTitle className="text-xl">
                            {formatDateRange(selectedDate, view)}
                        </CardTitle>

                        <div className="flex items-center gap-4">
                            {/* View Switcher */}
                            <ViewSwitcher currentView={view} date={selectedDate} />

                            {/* Navigation */}
                            <div className="flex gap-2">
                                <Link
                                    href={prevUrl}
                                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                                <Link
                                    href={todayUrl}
                                    className="px-3 py-2 hover:bg-slate-100 rounded transition-colors text-sm font-medium"
                                >
                                    今日
                                </Link>
                                <Link
                                    href={nextUrl}
                                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Legend (only for day/week view) */}
                    {(view === 'day' || view === 'week') && (
                        <div className="flex gap-4 text-sm mb-4 text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded"></div>
                                <span>予約済み</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-white border rounded"></div>
                                <span>空き時間</span>
                            </div>
                            {view === 'day' && (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-1 bg-red-500"></div>
                                    <span>現在時刻</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Calendar Views */}
                    {view === 'day' && staff.length > 0 && (
                        <div className="border rounded-lg overflow-hidden bg-white">
                            <StaffGridCalendar
                                date={selectedDate}
                                staff={staff}
                                bookings={bookingsWithDates}
                                members={members}
                            />
                        </div>
                    )}

                    {view === 'week' && staff.length > 0 && (
                        <WeekView
                            date={selectedDate}
                            staff={staff}
                            bookings={bookingsWithDates}
                            members={members}
                        />
                    )}

                    {view === 'month' && (
                        <MonthView
                            date={selectedDate}
                            bookings={bookingsWithDates}
                        />
                    )}

                    {staff.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <p>スタッフが登録されていません</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Booking Summary (only for day view) */}
            {view === 'day' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">本日の予約状況</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {bookings.length > 0 ? (
                            <div className="space-y-2">
                                {bookings.map(booking => (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: booking.staff.color }}
                                            ></div>
                                            <div>
                                                <div className="font-medium text-sm">{booking.member.name}様</div>
                                                <div className="text-xs text-slate-500">
                                                    {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')} / {booking.staff.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400">{booking.status}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-4">予約はありません</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
