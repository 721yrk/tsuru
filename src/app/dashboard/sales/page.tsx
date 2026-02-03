import { Card, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function SalesPage() {
    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-serif">売上表</h2>
                <p className="text-slate-500 mt-2">
                    売上データの確認・分析を行います。（準備中）
                </p>
            </div>

            <Card className="text-center py-20 bg-white border border-dashed border-slate-200">
                <CardContent>
                    <Construction className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">準備中</h3>
                    <p className="text-slate-500 mt-1">この機能は現在開発中です。</p>
                </CardContent>
            </Card>
        </div>
    )
}
