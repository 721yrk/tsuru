
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Image as ImageIcon, ArrowRight } from "lucide-react"
import { format } from "date-fns"

export function BodyRecordViewer({ records }: { records: any[] }) {
    // Sort by date desc
    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Pick "Latest" and "Oldest" (or 2nd latest) for comparison
    const after = sorted[0]
    const before = sorted.length > 1 ? sorted[sorted.length - 1] : null

    if (!after) return <div className="text-slate-400 text-center py-4">写真記録がありません</div>

    return (
        <Card className="h-full border-0 shadow-sm ring-1 ring-slate-100">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    ビフォーアフター (Body Record)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                    {/* Before */}
                    <div className="flex-1">
                        <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden relative group">
                            {before ? (
                                <img src={before.photoUrl} alt="Before" className="object-cover w-full h-full" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-xs text-slate-400">No Data</div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                                {before ? format(before.date, 'yyyy/MM') : '--'}
                            </div>
                            {before?.weight && (
                                <div className="absolute bottom-2 right-2 bg-white/80 text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                    {before.weight}kg
                                </div>
                            )}
                        </div>
                        <p className="text-center text-xs font-bold text-slate-500 mt-2">BEFORE</p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-300" />

                    {/* After */}
                    <div className="flex-1">
                        <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden relative ring-2 ring-emerald-100 shadow-lg">
                            <img src={after.photoUrl} alt="After" className="object-cover w-full h-full" />
                            <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] px-2 py-1 rounded-full shadow-sm">
                                {format(after.date, 'yyyy/MM')}
                            </div>
                            {after.weight && (
                                <div className="absolute bottom-2 right-2 bg-white/90 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                    {after.weight}kg
                                </div>
                            )}
                        </div>
                        <p className="text-center text-xs font-bold text-emerald-600 mt-2">AFTER</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
