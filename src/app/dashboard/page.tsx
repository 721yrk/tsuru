
import { getManagerStats } from "@/app/actions/dashboard"
import { ManagerCharts } from "@/components/dashboard/ManagerCharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCog, CalendarClock, TrendingUp } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const stats = await getManagerStats()

    return (
        <div className="p-8 space-y-8 bg-neutral-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-neutral-900">管理者ダッシュボード</h2>
                    <p className="text-neutral-500">店舗運営ステータス (Store Operations Status)</p>
                </div>
                <div className="text-sm text-neutral-500">
                    更新: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">総メンバー数</CardTitle>
                        <Users className="h-4 w-4 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMembers}</div>
                        <p className="text-xs text-neutral-500">アクティブ会員</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">トレーナー数</CardTitle>
                        <UserCog className="h-4 w-4 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTrainers}</div>
                        <p className="text-xs text-neutral-500">登録スタッフ</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">本日の予約数</CardTitle>
                        <CalendarClock className="h-4 w-4 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.todayReservations}</div>
                        <p className="text-xs text-neutral-500">本日のセッション予定</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">月間売上予測</CardTitle>
                        <TrendingUp className="h-4 w-4 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">¥{(stats.todayReservations * 6000).toLocaleString()}</div>
                        <p className="text-xs text-neutral-500">(本日時点の推計)</p>
                    </CardContent>
                </Card>
            </div>

            <ManagerCharts genderData={stats.genderDistribution} rankData={stats.rankDistribution} />
        </div>
    )
}
