
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function PlanSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>会員ランク・プラン設定</CardTitle>
                <CardDescription>
                    各ランクの割引率およびプランの基本料金を設定します。
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <h3 className="font-bold text-sm border-b pb-2 mb-4">ランク別割引率</h3>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="font-bold text-emerald-600">BRONZE (1年〜)</Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Input className="w-20 text-right" defaultValue="5" type="number" />
                            <span>% OFF</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="font-bold text-slate-400">SILVER (3年〜)</Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Input className="w-20 text-right" defaultValue="10" type="number" />
                            <span>% OFF</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="font-bold text-yellow-500">GOLD (5年〜)</Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Input className="w-20 text-right" defaultValue="20" type="number" />
                            <span>% OFF</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="font-bold text-slate-800">PLATINUM (7年〜)</Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Input className="w-20 text-right" defaultValue="30" type="number" />
                            <span>% OFF</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="font-bold text-blue-600">DIAMOND (10年〜)</Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Input className="w-20 text-right" defaultValue="50" type="number" />
                            <span>% OFF</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <h3 className="font-bold text-sm border-b pb-2 mb-4">基本プラン料金</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border p-3 rounded-lg">
                            <Label className="mb-2 block">STANDARD</Label>
                            <div className="flex items-center gap-1">
                                <span className="text-sm">¥</span>
                                <Input defaultValue="6,600" className="text-right" />
                            </div>
                        </div>
                        <div className="border p-3 rounded-lg bg-yellow-50 border-yellow-200">
                            <Label className="mb-2 block">PREMIUM</Label>
                            <div className="flex items-center gap-1">
                                <span className="text-sm">¥</span>
                                <Input defaultValue="11,000" className="text-right" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full">設定を保存</Button>
            </CardFooter>
        </Card>
    )
}
