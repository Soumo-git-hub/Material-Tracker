import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMaterialRequests } from "@/features/requests/hooks/useMaterialRequests"
import { ClipboardList, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"

export function StatsCards() {
    const { requests } = useMaterialRequests()

    const cards = [
        { label: "Total Volume", val: requests?.length || 0, icon: ClipboardList, color: "bg-blue-500/10 text-blue-600 border-blue-200/50", sub: "Global logged requests" },
        { label: "Pending", val: requests?.filter(r => r.status === 'pending').length || 0, icon: Clock, color: "bg-amber-500/10 text-amber-600 border-amber-200/50", sub: "Awaiting approval" },
        { label: "Critical", val: requests?.filter(r => r.priority === 'urgent').length || 0, icon: AlertTriangle, color: "bg-red-500/10 text-red-600 border-red-200/50", sub: "Urgent site needs" },
        { label: "Fulfilled", val: requests?.filter(r => r.status === 'fulfilled').length || 0, icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50", sub: "Completed transactions" },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((c, i) => (
                <Card key={i} className="border-border/60 shadow-sm bg-card hover:border-primary/30 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{c.label}</CardTitle>
                        <div className={`p-2 rounded-lg border ${c.color} shrink-0`}>
                            <c.icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight text-foreground/90">{c.val}</div>
                        <p className="text-[10px] font-medium text-muted-foreground/60 mt-1 uppercase tracking-tight">{c.sub}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
