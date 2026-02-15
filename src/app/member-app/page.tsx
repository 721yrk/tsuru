
import { prisma } from "@/lib/db"
import { calculateMemberStage, calculateMonthlyBill } from "@/lib/billing"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, QrCode, ChevronRight, CheckSquare } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function MemberHomePage() {
    const user = await prisma.user.findFirst({
        where: { email: 'suzuki@clover.com' },
        include: {
            memberProfile: {
                include: {
                    reservations: {
                        where: { status: { not: 'CANCELLED' } },
                        include: { trainer: true },
                        orderBy: { startTime: 'asc' }
                    },
                    mainTrainer: true,
                    // Fetch Homework (Promise)
                    promises: {
                        where: { status: 'PENDING', category: 'HOMEWORK' },
                        take: 1
                    }
                }
            }
        }
    })

    if (!user || !user.memberProfile) return <div>Loading...</div>

    const member = user.memberProfile
    const stage = calculateMemberStage(member.joinDate, member.manualDiscountRate)

    const currentMonthRes = member.reservations.filter(r => {
        const d = new Date(r.startTime)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

    const bill = calculateMonthlyBill(member, currentMonthRes)
    const nextReservation = member.reservations.find(r => new Date(r.startTime) > new Date())
    const homework = member.promises[0] // Latest pending homework

    return (
        <div className="bg-[#FAFDFB] min-h-screen pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-500 to-teal-600 text-white p-6 pt-12 rounded-b-[2.5rem] shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-indigo-50 text-xs mb-1 tracking-wider opacity-90">MEMBER ID: {member.id.slice(-6).toUpperCase()}</p>
                            <h1 className="text-2xl font-bold tracking-tight">{member.name} 様</h1>
                        </div>
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-sm">
                            <QrCode className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm border ${stage.name.includes("GOLD")
                                ? "bg-amber-100/90 text-amber-900 border-amber-200"
                                : "bg-white/90 text-indigo-900 border-indigo-100"
                            }`}>
                            {stage.name} 会員
                        </span>
                        {stage.discountRate > 0 && (
                            <span className="text-xs bg-red-500/90 text-white px-3 py-1.5 rounded-full font-bold shadow-sm">
                                {Math.round(stage.discountRate * 100)}% OFF適用
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4 -mt-6 relative z-20">
                {/* Homework Card (High Priority) */}
                {homework && (
                    <Card className="shadow-lg shadow-blue-200/50 border-0 ring-2 ring-blue-100 rounded-2xl bg-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-bold text-blue-500 mb-1 flex items-center gap-1">
                                    <CheckSquare className="w-3 h-3" /> 今日の宿題 (Homework)
                                </div>
                                <h3 className="font-bold text-slate-700 text-sm mb-1">{homework.title}</h3>
                                <p className="text-xs text-slate-500">{homework.description}</p>
                            </div>
                            <form action={async () => {
                                "use server"
                                // Mock Server Action for Check-off
                                console.log("Homework Done")
                            }}>
                                <button className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-full px-4 py-2 text-xs font-bold transition shadow-sm">
                                    完了！
                                </button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Next Reservation Card */}
                <Card className="shadow-lg shadow-slate-200/50 border-0 ring-1 ring-slate-100 rounded-2xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-2 border-b border-dashed border-slate-100">
                        <CardTitle className="text-sm font-bold text-slate-500 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-indigo-400 rounded-full"></span>
                            次回のご予約
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {nextReservation ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xl font-bold text-slate-800 tracking-tight">
                                        {format(nextReservation.startTime, 'M月d日 (E)', { locale: ja })}
                                    </div>
                                    <div className="text-sm text-slate-500 font-medium mt-1">
                                        {format(nextReservation.startTime, 'H:mm')} - {format(nextReservation.endTime, 'H:mm')}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] text-slate-400 mb-1">担当トレーナー</span>
                                    <div className="inline-flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                        <span className="font-bold text-sm text-indigo-700">{nextReservation.trainer.name}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-400 text-sm py-2 text-center">
                                次回の予約はありません
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Billing Receipt */}
                <Card className="shadow-lg shadow-slate-200/50 border-0 ring-1 ring-slate-100 rounded-2xl overflow-hidden">
                    <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-indigo-600" />
                            <CardTitle className="text-base font-bold text-slate-700">今月の請求予定</CardTitle>
                        </div>
                        <span className="text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">{format(new Date(), 'yyyy.MM')}</span>
                    </CardHeader>
                    <CardContent className="pt-6 bg-white">
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">基本プラン ({member.plan})</span>
                                <span className="font-bold text-slate-700">¥{bill.basePlanFee.toLocaleString()}</span>
                            </div>
                            {stage.discountRate > 0 && (
                                <div className="flex justify-between text-sm text-red-500 bg-red-50 p-2 rounded-lg">
                                    <span className="font-medium">継続割引</span>
                                    <span className="font-bold">-¥{(bill.basePlanFee - bill.discountedBasePlanFee).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-slate-500 font-medium">契約セッション <span className="text-xs text-slate-400 ml-1">(月{bill.details.contractedSessionCount}回)</span></span>
                                <span className="font-bold text-slate-700">¥{bill.contractedSessionFee.toLocaleString()}</span>
                            </div>

                            {bill.additionalSessionFee > 0 && (
                                <div className="py-3 border-t border-dashed border-slate-200 mt-2">
                                    <div className="text-xs font-bold text-indigo-600 mb-2 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-indigo-600 rounded-full"></span>
                                        追加利用分 (Pay As You Go)
                                    </div>
                                    {bill.details.additionalSessions.map((s, i) => (
                                        <div key={i} className="flex justify-between text-xs text-slate-500 mb-1 pl-2">
                                            <span>{format(s.date, 'M/d')} | {s.trainerName}</span>
                                            <span className="font-medium">+¥{s.rate.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
                                <span className="font-bold text-slate-600 text-sm">請求総額</span>
                                <span className="font-bold text-2xl text-indigo-700 tracking-tight">
                                    ¥{bill.total.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
