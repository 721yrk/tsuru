
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Save, History, Dumbbell, StickyNote, Clock, CalendarDays, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveWorkoutLog, getLastLog, getExerciseHistory } from "@/app/actions/workout"
import { getMasterExercises } from "@/app/actions/settings_exercises"
import { getExerciseStats } from "@/app/actions/stats"
import { format } from "date-fns"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function WorkoutLogger({ memberId, trainerId }: { memberId: string, trainerId?: string | null }) {
    const [categories, setCategories] = useState<string[]>([])
    const [exercises, setExercises] = useState<any[]>([])

    // Selection State - Init empty, set after fetch
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedExercise, setSelectedExercise] = useState("")
    const [isLoaded, setIsLoaded] = useState(false)

    // Log State
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [sets, setSets] = useState<{ id: number, weight: string, reps: string, notes: string, restSeconds: string }[]>([
        { id: 1, weight: "", reps: "", notes: "", restSeconds: "" }
    ])

    // Data State
    const [stats, setStats] = useState<{ max: any, min: any } | null>(null)
    const [history, setHistory] = useState<any[]>([])
    const [saving, setSaving] = useState(false)
    const [historyOpen, setHistoryOpen] = useState(false)

    // Reactivity State
    const [refreshKey, setRefreshKey] = useState(0)

    // Load Master Data & Smart Init
    useEffect(() => {
        const load = async () => {
            try {
                const all = await getMasterExercises()
                setExercises(all)
                const cats = Array.from(new Set(all.map((e: any) => e.category))) as string[]
                setCategories(cats)

                if (cats.length > 0) {
                    const firstCat = cats[0]
                    setSelectedCategory(firstCat)

                    const catExercises = all.filter((e: any) => e.category === firstCat)
                    if (catExercises.length > 0) {
                        setSelectedExercise(catExercises[0].name)
                    }
                }
                setIsLoaded(true)
            } catch (e) {
                console.error("Failed to load exercises", e)
            }
        }
        load()
    }, [])

    // Update Exercise List when Category Changes (Manual User Change)
    // Avoid resetting if loading initial state to prevent race conditions
    useEffect(() => {
        if (!isLoaded || !selectedCategory) return

        const exList = exercises.filter(e => e.category === selectedCategory)
        // If current selected exercise is NOT in this new category, switch to first available
        const exists = exList.find(e => e.name === selectedExercise)
        if (!exists && exList.length > 0) {
            setSelectedExercise(exList[0].name)
        }
    }, [selectedCategory, exercises, isLoaded])

    // Filter Logic
    const filteredExercises = exercises.filter(e => e.category === selectedCategory)

    // Fetch Stats & History when Exercise Changes OR Saved
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedExercise) return
            try {
                // Parallel fetch for speed
                const [s, h] = await Promise.all([
                    getExerciseStats(memberId, selectedExercise),
                    getExerciseHistory(memberId, selectedExercise)
                ])
                // @ts-ignore
                setStats(s)
                setHistory(h || [])
            } catch (e) {
                console.error("Fetch error", e)
            }
        }
        fetchData()
    }, [selectedExercise, memberId, historyOpen, refreshKey])

    // Chart Data - Safe sort
    const chartData = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const addSet = () => {
        const lastSet = sets[sets.length - 1]
        setSets([...sets, {
            id: Date.now(),
            weight: lastSet ? lastSet.weight : "",
            reps: "",
            notes: "",
            restSeconds: ""
        }])
    }

    const updateSet = (index: number, field: string, value: string) => {
        const newSets = [...sets]
        // @ts-ignore
        newSets[index][field] = value
        setSets(newSets)
    }

    const handleSave = async () => {
        if (saving) return

        // CRITICAL VALIDATION: Prevent FK errors
        if (!selectedExercise || selectedExercise === "") {
            alert("エラー: 種目が選択されていません。ページを再読み込みしてください。")
            return
        }

        if (!memberId || memberId === "") {
            alert("エラー: メンバーIDが無効です。")
            return
        }

        // trainerId is optional - can be null
        setSaving(true)

        try {
            const formattedSets = sets.map((s, i) => ({
                exerciseName: selectedExercise,
                weight: parseFloat(s.weight) || 0,
                reps: parseInt(s.reps) || 0,
                setNumber: i + 1,
                notes: s.notes,
                restSeconds: parseInt(s.restSeconds) || 0
            })).filter(s => s.weight > 0 || s.reps > 0) // Filter empty sets

            if (formattedSets.length === 0) {
                alert("重量または回数を入力してください")
                setSaving(false)
                return
            }

            console.log("Submitting...", { memberId, trainerId, exercise: selectedExercise, setsCount: formattedSets.length })
            const res = await saveWorkoutLog(memberId, trainerId ?? null, formattedSets, date)

            if (res.success) {
                // Success Flow
                setSets([{ id: Date.now(), weight: "", reps: "", notes: "", restSeconds: "" }])
                setRefreshKey(prev => prev + 1) // FORCE REFRESH
                alert("保存しました")
            } else {
                // Error Flow
                alert(`エラー: ${res.error}`)
            }
        } catch (e) {
            console.error("Save error:", e)
            alert("保存に失敗しました。通信環境を確認してください。")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card className="h-full border-2 border-indigo-100 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                    <CardTitle className="flex items-center gap-2 text-indigo-800">
                        <Dumbbell className="w-5 h-5" />
                        トレーニング記録
                    </CardTitle>
                    <div className="flex items-center gap-1 bg-white border rounded px-2 py-1">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            className="text-xs border-none focus:ring-0 p-0 text-slate-600"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* 2-Step Filter */}
                <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[100px] h-8 text-xs bg-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                        <SelectTrigger className="flex-1 h-8 text-xs bg-white font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredExercises.map(e => <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4 max-h-[390px] overflow-y-auto">
                {/* Stats Row - Robust Check */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                    <div className="bg-red-50 p-2 rounded flex items-center justify-between">
                        <div className="flex items-center gap-1 text-red-500 font-bold"><TrendingUp className="w-3 h-3" /> MAX</div>
                        <div>
                            {stats?.max ? `${stats.max.weight}kg` : '-- kg'}
                            <span className="text-slate-400 ml-1">
                                {stats?.max ? `(${stats.max.date})` : ''}
                            </span>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded flex items-center justify-between">
                        <div className="flex items-center gap-1 text-blue-500 font-bold"><TrendingDown className="w-3 h-3" /> MIN</div>
                        <div>
                            {stats?.min ? `${stats.min.weight}kg` : '-- kg'}
                            <span className="text-slate-400 ml-1">
                                {stats?.min ? `(${stats.min.date})` : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Chart (Mini) - Always Render Container */}
                <div className="h-24 w-full bg-slate-50 rounded-lg p-2 relative">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <Tooltip contentStyle={{ fontSize: '10px' }} />
                                {/* Add isAnimationActive={false} to prevent weird initial state glitches */}
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    isAnimationActive={false}
                                />
                                <XAxis dataKey="displayDate" hide />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-xs text-slate-400">
                            データなし
                        </div>
                    )}
                </div>

                {/* Input Rows - Scrollable with constrained height */}
                <div className="space-y-4 max-h-[180px] overflow-y-auto pr-1">
                    {sets.map((set, index) => (
                        <div key={set.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative">
                            <div className="absolute top-2 left-2 w-5 text-xs text-white text-center font-bold bg-indigo-500 rounded-full h-5 leading-5 shadow-sm">{index + 1}</div>

                            <div className="absolute top-2 right-2">
                                <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-indigo-600">
                                            <History className="w-4 h-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>{selectedExercise} の履歴</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 mt-2">
                                            {history.length > 0 ? history.map((h, i) => (
                                                <div key={i} className="border-b pb-2 text-sm">
                                                    <div className="flex justify-between font-bold text-slate-700">
                                                        <span>{h.displayDate}</span>
                                                        <span>{h.weight}kg x {h.reps}回</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">{h.notes}</div>
                                                </div>
                                            )) : (
                                                <div className="text-center text-slate-500 py-4">履歴データなし</div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="mt-6 flex gap-2 mb-2">
                                <div className="flex items-center gap-1 flex-1">
                                    <Input
                                        type="number"
                                        className="h-10 text-center bg-slate-50 font-bold text-lg"
                                        placeholder="0"
                                        value={set.weight}
                                        onChange={(e) => updateSet(index, 'weight', e.target.value)}
                                    />
                                    <span className="text-xs text-slate-500 w-4">kg</span>
                                </div>
                                <div className="flex items-center gap-1 flex-1">
                                    <Input
                                        type="number"
                                        className="h-10 text-center bg-slate-50 font-bold text-lg"
                                        placeholder="0"
                                        value={set.reps}
                                        onChange={(e) => updateSet(index, 'reps', e.target.value)}
                                    />
                                    <span className="text-xs text-slate-500 w-6">reps</span>
                                </div>
                            </div>

                            {/* Rest & Memo Row */}
                            <div className="flex gap-2">
                                <div className="relative w-24 shrink-0">
                                    <Clock className="w-3 h-3 absolute top-3 left-2 text-slate-400" />
                                    <Input
                                        type="number"
                                        className="h-8 pl-6 pr-1 text-xs bg-slate-50"
                                        placeholder="秒"
                                        value={set.restSeconds}
                                        onChange={(e) => updateSet(index, 'restSeconds', e.target.value)}
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <StickyNote className="w-3 h-3 absolute top-3 left-2 text-slate-400" />
                                    <Input
                                        className="h-8 pl-6 text-xs bg-slate-50"
                                        placeholder="メモ"
                                        value={set.notes}
                                        onChange={(e) => updateSet(index, 'notes', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={addSet} className="flex-1 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                        <Plus className="w-4 h-4 mr-1" /> セット追加
                    </Button>
                    <Button onClick={handleSave} disabled={saving || !isLoaded || !selectedExercise} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                        {saving ? "保存中..." : "記録保存"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
