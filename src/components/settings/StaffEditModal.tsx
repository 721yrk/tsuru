
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateStaff } from "@/app/actions/settings"

const ROLE_PRICES: Record<string, number> = {
    "Wellness Coordinator": 7150,
    "Wellness Coach": 6050,
    "Wellness Supporter": 4950
}

export function StaffEditModal({ staff }: { staff: { id: string, name: string, email: string, role: string, title?: string, unitPrice?: number } }) {
    const [open, setOpen] = useState(false)
    const [selectedTitle, setSelectedTitle] = useState(staff.title || "Wellness Coach")
    const [price, setPrice] = useState(staff.unitPrice || 6050)

    const handleTitleChange = (val: string) => {
        setSelectedTitle(val)
        if (ROLE_PRICES[val]) {
            setPrice(ROLE_PRICES[val])
        }
    }

    const handleSubmit = async (formData: FormData) => {
        await updateStaff(formData)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">編集</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <input type="hidden" name="id" value={staff.id} />
                    <DialogHeader>
                        <DialogTitle>スタッフ情報編集</DialogTitle>
                        <DialogDescription>
                            役職を選択すると単価が自動設定されます。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">名前</Label>
                            <Input id="name" name="name" defaultValue={staff.name} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" name="email" defaultValue={staff.email} className="col-span-3" />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">役職</Label>
                            <div className="col-span-3">
                                <Select name="title" value={selectedTitle} onValueChange={handleTitleChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="役職を選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Wellness Coordinator">Wellness Coordinator</SelectItem>
                                        <SelectItem value="Wellness Coach">Wellness Coach</SelectItem>
                                        <SelectItem value="Wellness Supporter">Wellness Supporter</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">単価 (¥)</Label>
                            <Input id="price" name="unitPrice" value={price} readOnly className="col-span-3 bg-slate-100" type="number" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">保存する</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
