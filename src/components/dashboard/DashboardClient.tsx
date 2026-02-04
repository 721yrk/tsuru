"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, TrendingUp, Calendar, ArrowUpRight } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface DashboardData {
    summary: {
        totalMembers: number
        totalTrainers: number
        todayBookings: number
        monthlySalesForecast: number
    }
    contractData: { name: string; value: number; color: string }[]
    genderData: { name: string; value: number; color: string }[]
    rankData: { name: string; value: number; color: string }[]
}

export default function DashboardClient({ data }: { data?: DashboardData }) {
    // Fallback to zeros if no data
    const summary = data?.summary || { totalMembers: 0, totalTrainers: 0, todayBookings: 0, monthlySalesForecast: 0 }

    // Default empty arrays or use data
    const contractData = data?.contractData || []
    const genderData = data?.genderData || []

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-serif">ダッシュボード</h2>
                <p className="text-slate-500 mt-2">
                    店舗運営の状況を一目で確認できます。
                </p>
            </div>

            {/* 1. Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">総会員数</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalMembers}名</div>
                        <p className="text-xs text-slate-500">アクティブ会員</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">トレーナー数</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalTrainers}名</div>
                        <p className="text-xs text-slate-500">登録スタッフ</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">本日の予約数</CardTitle>
                        <Calendar className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.todayBookings}</div>
                        <p className="text-xs text-slate-500">本日のセッション予定</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">月間売上予測</CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">¥{summary.monthlySalesForecast.toLocaleString()}</div>
                        <p className="text-xs text-slate-500">(本日時点の推計)</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* 2. Contract/Rank Breakdown */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>契約タイプ内訳 (Rank)</CardTitle>
                        <CardDescription>
                            全会員の契約プラン分布
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <div className="h-[250px] w-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={contractData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {contractData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4 text-sm w-full max-w-xs">
                            {contractData.map(item => (
                                <div key={item.name} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span>{item.name}</span>
                                    </div>
                                    <span className="font-bold">{item.value}名</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Gender Distribution */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>メンバー男女比</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                        <div className="h-[200px] w-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex gap-4 text-sm text-slate-500">
                            {genderData.map(g => (
                                <div key={g.name} className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full" style={{ background: g.color }}></div>
                                    {g.name} ({g.value})
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
