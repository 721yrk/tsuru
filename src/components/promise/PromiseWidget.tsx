
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { togglePromiseStatus } from "@/app/actions/promise"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

export function PromiseWidget({ promises }: { promises: any[] }) {
    const [isPending, startTransition] = useTransition()

    const handleToggle = (id: string) => {
        startTransition(async () => {
            await togglePromiseStatus(id)
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>今週の約束 (宿題)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {promises.map((p) => (
                        <div key={p.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-neutral-50/50">
                            <Checkbox
                                id={p.id}
                                checked={p.status === "COMPLETED"}
                                onCheckedChange={() => handleToggle(p.id)}
                            />
                            <div className="space-y-1">
                                <label htmlFor={p.id} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", p.status === "COMPLETED" && "line-through text-neutral-400")}>
                                    {p.title}
                                </label>
                                <div className="flex gap-2">
                                    <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                                    <span className="text-xs text-neutral-500">期限: {new Date(p.dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {promises.length === 0 && <p className="text-sm text-neutral-500">約束はありません。</p>}
                </div>
            </CardContent>
        </Card>
    )
}
