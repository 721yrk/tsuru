"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Progress } from "@/components/ui/progress"

// Mock Data (In production, pass these via Props from Server Component)
const contractData = [
    { name: "スタンダード (Standard)", value: 45, color: "#10b981" }, // emerald-500
    { name: "プレミアム (Premium)", value: 20, color: "#3b82f6" }, // blue-500
    { name: "デジタルプリペイド", value: 15, color: "#f59e0b" }, // amber-500
    { name: "回数券", value: 10, color: "#8b5cf6" }, // violet-500
]

const genderData = [
    { name: "男性", value: 35, color: "#3b82f6" },
    { name: "女性", value: 55, color: "#ec4899" },
    { name: "不明", value: 10, color: "#94a3b8" },
]

const ageData = [
    { age: "10代", male: 2, female: 5 },
    { age: "20代", male: 8, female: 12 },
    { age: "30代", male: 15, female: 20 },
    { age: "40代", male: 12, female: 15 },
    { age: "50代", male: 8, female: 10 },
    { age: "60代", male: 5, female: 8 },
    { age: "70代", male: 3, female: 4 },
    { age: "80代", male: 1, female: 2 },
]

const reservationData = [
    { name: "スタンダード", value: 120 },
    { name: "プレミアム", value: 80 },
    { name: "プリペイド", value: 45 },
    { name: "回数券", value: 30 },
    { name: "追加", value: 15 },
    { name: "振替", value: 10 },
]

export default function DashboardClient() {
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
                        <div className="text-2xl font-bold">128名</div>
                        <p className="text-xs text-slate-500">+4名 (先月比)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">月間売上予想</CardTitle>
                        <CreditCard className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">¥1,240,000</div>
                        <p className="text-xs text-emerald-500 flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> +12% (先月比)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">年間売上見込</CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">¥14,800,000</div>
                        <p className="text-xs text-slate-500">達成率 45%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">今月のフロー</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-xs mb-1">
                            <span>体験: <span className="font-bold text-slate-700">8</span></span>
                            <span>入会: <span className="font-bold text-emerald-600">5</span></span>
                            <span>退会: <span className="font-bold text-red-500">1</span></span>
                        </div>

                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* 2. Contract Breakdown */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>契約タイプ内訳</CardTitle>
                        <CardDescription>
                            全会員の契約プラン分布 (合計: 90名)
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

                {/* 3. Slot Capacity */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>メンバー枠空き状況</CardTitle>
                        <CardDescription>
                            担当トレーナーごとの残り枠数 (月間定員60枠)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">ゆうじ (Yuji)</span>
                                <span className="text-sm text-slate-500">残り <span className="font-bold text-slate-900">12</span> / 60枠</span>
                            </div>
                            <Progress value={80} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">りさ (Risa)</span>
                                <span className="text-sm text-slate-500">残り <span className="font-bold text-slate-900">24</span> / 60枠</span>
                            </div>
                            <Progress value={60} className="h-2" />
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mt-4">
                            <p className="text-xs text-slate-500 text-center">
                                現在の予約状況は安定しています。新規枠の開放を検討してください。
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {/* 4. Age & Gender Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>会員属性 (年代・男女比)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={ageData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <XAxis type="number" />
                                    <YAxis dataKey="age" type="category" width={40} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="male" name="男性" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="female" name="女性" stackId="a" fill="#ec4899" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex justify-center gap-8 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span>男性: 35%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-pink-500" />
                                <span>女性: 65%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Reservation Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>月間予約・利用内訳</CardTitle>
                        <CardDescription>今月の予約総数: 300件</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reservationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis hide />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} label={{ position: 'top' }}>
                                        {
                                            reservationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={
                                                    index === 0 ? '#10b981' : // Standard
                                                        index === 1 ? '#3b82f6' : // Premium
                                                            index === 2 ? '#f59e0b' : // Prepaid
                                                                '#94a3b8' // Others
                                                } />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
