
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Image as ImageIcon, Plus, ArrowRight } from "lucide-react"
import { addBodyRecord, getBodyRecords } from "@/app/actions/members_actions"
import { format } from "date-fns"

export function BodyGallery({ memberId }: { memberId: string }) {
    const [records, setRecords] = useState<any[]>([])
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        const load = async () => {
            const data = await getBodyRecords(memberId)
            setRecords(data)
        }
        load()
    }, [memberId])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result as string
            await addBodyRecord(memberId, base64)
            const data = await getBodyRecords(memberId)
            setRecords(data)
            setUploading(false)
        }
        reader.readAsDataURL(file)
    }

    const before = records.length > 0 ? records[0] : null
    const after = records.length > 1 ? records[records.length - 1] : null

    return (
        <Card className="h-full border-t-4 border-t-purple-400 shadow-sm flex flex-col">
            <CardHeader className="pb-2 border-b bg-purple-50/30 flex flex-row justify-between items-center py-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-700">
                    <Camera className="w-4 h-4" />
                    ボディ・ギャラリー (Before / After)
                </CardTitle>
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <Button size="sm" variant="outline" className="h-7 text-xs bg-white border-purple-200 text-purple-700 hover:bg-purple-50" disabled={uploading}>
                        <Plus className="w-3 h-3 mr-1" />
                        {uploading ? "保存中..." : "写真を追加"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex items-center justify-center bg-slate-50 relative overflow-hidden">
                {records.length === 0 ? (
                    <div className="text-center text-slate-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <div className="text-xs">写真記録はまだありません</div>
                    </div>
                ) : (
                    <div className="flex w-full h-full gap-4 items-center justify-center">
                        {/* Before */}
                        <div className="flex-1 flex flex-col items-center h-full max-w-[45%]">
                            <div className="text-[10px] font-bold text-slate-500 mb-1 bg-slate-200 px-2 rounded-full">BEFORE</div>
                            <div className="relative w-full h-full bg-black rounded overflow-hidden shadow-sm flex items-center justify-center bg-slate-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={before.photoUrl} alt="Before" className="max-h-full max-w-full object-contain" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center">
                                    {format(new Date(before.date), 'yyyy/MM/dd')}
                                </div>
                            </div>
                        </div>

                        {/* Arrow or Spacer */}
                        {after && <ArrowRight className="w-6 h-6 text-slate-300 shrink-0" />}

                        {/* After (Only if 2+ records) */}
                        {after && (
                            <div className="flex-1 flex flex-col items-center h-full max-w-[45%]">
                                <div className="text-[10px] font-bold text-slate-500 mb-1 bg-purple-100 text-purple-700 px-2 rounded-full">AFTER</div>
                                <div className="relative w-full h-full bg-black rounded overflow-hidden shadow-sm flex items-center justify-center bg-slate-200">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={after.photoUrl} alt="After" className="max-h-full max-w-full object-contain" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center">
                                        {format(new Date(after.date), 'yyyy/MM/dd')}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
