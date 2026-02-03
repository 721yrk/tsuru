"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" // Missing component, but let's assume standard
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Pencil, Trash2, Plus, Clock, Banknote } from "lucide-react"
import { createServiceMenu, updateServiceMenu, deleteServiceMenu } from "@/app/actions/booking_actions"

type ServiceMenu = {
    id: string
    name: string
    duration: number
    price: number
    description: string | null
    isActive: boolean
}

export function ServiceMenuManager({ initialMenus }: { initialMenus: ServiceMenu[] }) {
    const [menus, setMenus] = useState(initialMenus)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMenu, setEditingMenu] = useState<ServiceMenu | null>(null)
    const [formData, setFormData] = useState({ name: "", duration: 60, price: 0, description: "" })

    const handleOpen = (menu?: ServiceMenu) => {
        if (menu) {
            setEditingMenu(menu)
            setFormData({
                name: menu.name,
                duration: menu.duration,
                price: menu.price,
                description: menu.description || ""
            })
        } else {
            setEditingMenu(null)
            setFormData({ name: "", duration: 60, price: 0, description: "" })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        try {
            if (editingMenu) {
                await updateServiceMenu(editingMenu.id, formData)
            } else {
                await createServiceMenu(formData)
            }
            // In a real app, use router.refresh(), but for now optimistically update or reload
            window.location.reload()
            setIsDialogOpen(false)
        } catch (error) {
            console.error("Failed to save menu", error)
            alert("保存に失敗しました")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("本当に削除しますか？")) return
        await deleteServiceMenu(id)
        window.location.reload()
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            予約メニュー設定
                        </CardTitle>
                        <CardDescription>
                            予約可能なコース・メニューを管理します。
                        </CardDescription>
                    </div>
                    <Button onClick={() => handleOpen()} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" /> 新規作成
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {menus.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            メニューが登録されていません。
                        </div>
                    )}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {menus.map((menu) => (
                            <div key={menu.id} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow relative group">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpen(menu)}>
                                        <Pencil className="w-4 h-4 text-slate-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(menu.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <h3 className="font-bold text-lg mb-1">{menu.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {menu.duration}分
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Banknote className="w-3 h-3" /> ¥{menu.price.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5em]">
                                    {menu.description || "説明なし"}
                                </p>
                                <div className="mt-3 flex justify-between items-center">
                                    <Badge variant={menu.isActive ? "default" : "secondary"}>
                                        {menu.isActive ? "公開中" : "非公開"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingMenu ? "メニュー編集" : "新規メニュー作成"}</DialogTitle>
                        <DialogDescription>
                            予約枠の確保時間と基本料金を設定します。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>メニュー名</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="例：パーソナルトレーニング60分"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>所要時間 (分)</Label>
                                <Input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>料金 (税込)</Label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>説明・メモ</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="管理用メモや顧客への説明"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>キャンセル</Button>
                        <Button onClick={handleSubmit}>保存</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
