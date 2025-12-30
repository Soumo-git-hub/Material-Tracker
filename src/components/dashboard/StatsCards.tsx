import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMaterialRequests } from "@/hooks/useMaterialRequests"
import { ClipboardList, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"

export function StatsCards() {
    const { requests } = useMaterialRequests()

    const stats = {
        total: requests?.length || 0,
        pending: requests?.filter(r => r.status === 'pending').length || 0,
        urgent: requests?.filter(r => r.priority === 'urgent').length || 0,
        fulfilled: requests?.filter(r => r.status === 'fulfilled').length || 0,
    }

    return (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden bg-card/40 backdrop-blur-md border-border/50 group transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <ClipboardList className="h-16 w-16 -mr-4 -mt-4" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Requests</CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                        <ClipboardList className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black tracking-tight">{stats.total}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Total Volume</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-card/40 backdrop-blur-md border-border/50 group transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
                <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Clock className="h-16 w-16 -mr-4 -mt-4 transition-transform group-hover:rotate-12" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending</CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20">
                        <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black tracking-tight text-amber-500">{stats.pending}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Awaiting Action</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-card/40 backdrop-blur-md border-border/50 group transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5">
                <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <AlertTriangle className="h-16 w-16 -mr-4 -mt-4" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Urgent</CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black tracking-tight text-red-500">{stats.urgent}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-1 w-1 rounded-full bg-red-500 animate-bounce" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Critical Items</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-card/40 backdrop-blur-md border-border/50 group transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
                <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <CheckCircle2 className="h-16 w-16 -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fulfilled</CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black tracking-tight text-emerald-500">{stats.fulfilled}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Completed</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
