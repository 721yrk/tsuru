
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

export function ReservationHeatmap() {
    // Mock Data for "Reservation Density" (7 days x 24 hours - relevant hours 10-22)
    const days = ['日', '月', '火', '水', '木', '金', '土']
    const hours = [10, 12, 14, 16, 18, 20]

    // Random "heat" 0-3 (0: None, 1: Low, 2: Med, 3: High)
    const getHeat = (d: number, h: number) => {
        // Mock pattern: Weekends busy, Weekday evenings busy
        if (d === 0 || d === 6) return Math.random() > 0.3 ? 3 : 2
        if (h >= 18) return Math.random() > 0.4 ? 3 : 1
        return Math.random() > 0.7 ? 2 : 0
    }

    return (
        <Card className="h-full border-0 shadow-sm ring-1 ring-slate-100">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                    <Activity className="w-4 h-4 text-orange-500" />
                    予約稼働状況 (ヒートマップ)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-1">
                    <div className="flex gap-1 ml-6 mb-1">
                        {hours.map(h => (
                            <div key={h} className="flex-1 text-[10px] text-slate-400 text-center">{h}時</div>
                        ))}
                    </div>
                    {days.map((day, dIndex) => (
                        <div key={day} className="flex gap-1 items-center">
                            <span className="text-[10px] font-bold text-slate-500 w-6">{day}</span>
                            {hours.map(h => {
                                const level = getHeat(dIndex, h)
                                const colors = [
                                    "bg-slate-50", // 0
                                    "bg-indigo-100", // 1
                                    "bg-indigo-300", // 2
                                    "bg-indigo-500", // 3
                                ]
                                return (
                                    <div
                                        key={h}
                                        className={`flex-1 h-6 rounded-sm ${colors[level]} transition hover:opacity-80`}
                                        title={`${day} ${h}:00 - Level ${level}`}
                                    ></div>
                                )
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2 mt-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-100"></div>空き</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-300"></div>通常</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500"></div>混雑</span>
                </div>
            </CardContent>
        </Card>
    )
}
