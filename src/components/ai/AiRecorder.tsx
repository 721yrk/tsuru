
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Loader2, FileText, CheckCircle, Wand2, Keyboard } from "lucide-react"
import { processRealSessionRecording } from "@/app/actions/analyze-record"

// Demo Conversation Data
const DEMO_CONVERSATION = `
(トレーナー): こんにちは、今日の体調はいかがですか？
(会員): 今日は少し腰が痛くて、あまり無理したくないんです。
(トレーナー): わかりました。では今日はベンチプレスは軽めにして、ストレッチを中心にやりましょうか。
(会員): はい、お願いします。昨日よく眠れなくて、なんとなくダルいんですよね。
(トレーナー): 了解です。ではフォーム確認をメインにして、重量は上げずに行きましょう。可動域を確認しながら進めますね。
(会員): ありがとうございます。
`

export function AiRecorder({ members, currentTrainerId }: { members: any[], currentTrainerId: string }) {
    const [isRecording, setIsRecording] = useState(false)
    const [duration, setDuration] = useState(0)
    const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "")
    const [status, setStatus] = useState<'IDLE' | 'RECORDING' | 'PROCESSING' | 'COMPLETED'>('IDLE')
    const [transcript, setTranscript] = useState("")
    const [result, setResult] = useState<string | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const recognitionRef = useRef<any>(null)

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.continuous = true
                recognition.interimResults = true
                recognition.lang = 'ja-JP'

                recognition.onresult = (event: any) => {
                    let finalTrans = ''
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTrans += event.results[i][0].transcript
                        } else {
                            // Interim
                        }
                    }
                    if (finalTrans) {
                        setTranscript(prev => prev + "\n" + finalTrans)
                    }
                }

                recognition.onerror = (event: any) => {
                    console.error("Speech Recognition Error", event.error)
                }

                recognitionRef.current = recognition
            }
        }
    }, [])

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1)
            }, 1000)
            recognitionRef.current?.start()
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
            recognitionRef.current?.stop()
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [isRecording])

    const handleToggleRecord = async () => {
        if (isRecording) {
            // Stop and Process
            setIsRecording(false)
            setStatus('PROCESSING')

            // Simulate AI "Thinking"
            await new Promise(r => setTimeout(r, 1500))

            const response = await processRealSessionRecording(selectedMemberId, currentTrainerId, transcript)
            if (response.success) {
                setResult(response.summary || "")
                setStatus('COMPLETED')
            }
        } else {
            // Start
            setTranscript("")
            setDuration(0)
            setResult(null)
            setIsRecording(true)
            setStatus('RECORDING')
        }
    }

    const handleDemoInput = () => {
        setTranscript(DEMO_CONVERSATION.trim())
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1 shadow-lg border-blue-100">
                <CardHeader>
                    <CardTitle className="text-blue-900">セッション録音 (Web Speech API)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">メンバー選択</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            value={selectedMemberId}
                            onChange={(e) => setSelectedMemberId(e.target.value)}
                            disabled={isRecording || status === 'PROCESSING'}
                        >
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col items-center justify-center py-10 space-y-4 bg-neutral-50 rounded-xl border-2 border-dashed border-blue-200">
                        {status === 'RECORDING' && (
                            <div className="text-4xl font-mono font-bold text-red-500 animate-pulse">
                                {formatTime(duration)}
                            </div>
                        )}
                        {status === 'IDLE' && <div className="text-neutral-400">マイク待機中...</div>}
                        {status === 'PROCESSING' && <div className="flex items-center text-blue-500"><Loader2 className="animate-spin mr-2" /> AI 要約生成中...</div>}
                        {status === 'COMPLETED' && <div className="flex items-center text-green-500"><CheckCircle className="mr-2" /> 保存完了</div>}

                        <Button
                            size="lg"
                            variant={isRecording ? "destructive" : "default"}
                            className={`rounded-full w-20 h-20 shadow-xl ${isRecording ? "animate-pulse" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"}`}
                            onClick={handleToggleRecord}
                            disabled={status === 'PROCESSING'}
                        >
                            {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                        </Button>
                        <p className="text-sm text-neutral-500 font-medium">
                            {isRecording ? "会話を録音中..." : "タップして録音開始"}
                        </p>

                        {!isRecording && status !== 'PROCESSING' && (
                            <Button variant="outline" size="sm" onClick={handleDemoInput} className="mt-2 text-xs text-neutral-500">
                                <Keyboard className="w-3 h-3 mr-1" />
                                デモ会話を入力 (Test)
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-1 shadow-lg border-green-100 bg-white">
                <CardHeader className="border-b border-neutral-100 bg-neutral-50/50">
                    <CardTitle className="text-green-800 flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-green-600 " />
                        リアルタイム解析
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] flex flex-col p-0">
                    {/* Transcript Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-neutral-50 border-b border-neutral-200">
                        {transcript ? (
                            <p className="whitespace-pre-wrap text-sm text-neutral-700 leading-relaxed font-mono">
                                {transcript}
                            </p>
                        ) : (
                            <p className="text-neutral-400 text-sm italic py-8 text-center">
                                ここに会話内容がリアルタイムで表示されます...
                            </p>
                        )}
                    </div>

                    {/* Result Area */}
                    <div className="flex-1 p-4 bg-white overflow-y-auto">
                        {status === 'COMPLETED' && result ? (
                            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-2">
                                    <CheckCircle className="w-4 h-4" />
                                    AI要約完了 (SOAP形式)
                                </div>
                                <div className="text-sm text-neutral-800 whitespace-pre-wrap bg-green-50 p-3 rounded-lg border border-green-100 shadow-sm leading-relaxed">
                                    {result}
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                {status === 'PROCESSING' ? (
                                    <p className="text-blue-500 text-sm animate-pulse">要約を生成しています...</p>
                                ) : (
                                    <p className="text-neutral-300 text-sm">記録終了後にAI要約が表示されます</p>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
