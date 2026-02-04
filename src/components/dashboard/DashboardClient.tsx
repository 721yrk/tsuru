"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, TrendingUp, UserPlus, UserMinus, CalendarCheck, Wallet } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface DashboardData {
    memberStats: {
        total: number;
        standard: number;
        premium: number;
        digitalPrepaid: number;
        ticket: number;
    };
    genderData: any[]; // { name, value, color }
    ageData: any[]; // { age, male, female }
    capacityData: any[]; // { name, current, max }
    financials: {
        monthly: number;
        annual: number;
    };
    flow: {
        newEntries: number;
        withdrawals: number;
        trials: number;
    };
    bookingStats: {
        total: number;
        standard: number;
        premium: number;
        digitalPrepaid: number;
        ticket: number;
        additional: number;
        transfer: number;
    };
}

export default function DashboardClient({ data }: { data: DashboardData }) {
    if (!data) return <div className="p-8">Loading...</div>

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val)
    }

    return (
        cy = "50%"
                                        innerRadius = { 60}
    outerRadius = { 80}
    paddingAngle = { 5}
    dataKey = "value"
        >
    {
        genderData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
        ))
    }
                                    </Pie >
        <Tooltip />
                                </PieChart >
                            </ResponsiveContainer >
                        </div >
        <div className="mt-4 flex gap-4 text-sm text-slate-500">
            {genderData.map(g => (
                <div key={g.name} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: g.color }}></div>
                    {g.name} ({g.value})
                </div>
            ))}
        </div>
                    </CardContent >
                </Card >
            </div >
        </div >
    )
}
