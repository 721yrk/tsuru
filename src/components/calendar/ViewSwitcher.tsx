'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import Link from 'next/link'
import { ViewType } from '@/lib/calendar-utils'
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react'

interface ViewSwitcherProps {
    currentView: ViewType
    date: Date
}

export function ViewSwitcher({ currentView, date }: ViewSwitcherProps) {
    const dateStr = format(date, 'yyyy-MM-dd')

    return (
        <Tabs value={currentView} className="w-full max-w-[300px]">
            <TabsList className="grid w-full grid-cols-3">
                <Link href={`/dashboard/calendar?date=${dateStr}&view=month`}>
                    <TabsTrigger value="month" className="text-sm w-full">
                        <CalendarRange className="w-4 h-4 mr-1" />
                        月
                    </TabsTrigger>
                </Link>
                <Link href={`/dashboard/calendar?date=${dateStr}&view=week`}>
                    <TabsTrigger value="week" className="text-sm w-full">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        週
                    </TabsTrigger>
                </Link>
                <Link href={`/dashboard/calendar?date=${dateStr}&view=day`}>
                    <TabsTrigger value="day" className="text-sm w-full">
                        <Calendar className="w-4 h-4 mr-1" />
                        日
                    </TabsTrigger>
                </Link>
            </TabsList>
        </Tabs>
    )
}
