import { EducationView } from "@/components/education/EducationView"

export default function EducationPage() {
    return (
        <div className="h-full bg-slate-50">
            <div className="px-4 py-2 border-b border-slate-200 bg-white shadow-sm flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-800">説明ツール (Body Education)</h1>
            </div>
            <EducationView />
        </div>
    )
}
