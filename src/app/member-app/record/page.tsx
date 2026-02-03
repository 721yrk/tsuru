
import { AlertCircle, Trophy, History } from "lucide-react"

export default function MemberRecordPage() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <header className="bg-white p-4 sticky top-0 z-10 shadow-sm">
                <h1 className="font-bold text-lg">マイカルテ</h1>
            </header>

            <div className="p-4 space-y-4">
                {/* Goals Card */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                    <Trophy className="absolute right-2 bottom-[-10px] w-24 h-24 text-white/10 rotate-12" />
                    <h2 className="text-sm font-bold opacity-90 mb-1">現在の目標</h2>
                    <p className="text-2xl font-bold">ベンチプレス 100kg</p>
                    <p className="text-xs opacity-80 mt-2">期限: 2026年3月まで</p>
                </div>

                {/* AI Log List (Mock) */}
                <div>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
                        <History className="w-4 h-4" /> トレーニング履歴 (AI分析)
                    </h2>

                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">1/{16 - i * 2}</div>
                                        <span className="font-bold text-sm text-slate-700">胸・肩の日</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">担当: 夏井</div>
                                </div>
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                    ベンチプレスのフォームが安定してきました。
                                    次回は重量を2.5kg上げて挑戦してみましょう。
                                    肩の筋肉痛がある場合は無理をせずストレッチを重点的に...
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
