import { Navigate } from "react-router-dom"
import { format } from "date-fns"
import { AlertCircle, Sparkles, Building2, Clock } from "lucide-react"

import { StatsCards } from "@/components/dashboard/StatsCards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { useMaterialRequests } from "@/hooks/useMaterialRequests"

export default function DashboardPage() {
    const { profile, loading } = useAuth()
    const { requests } = useMaterialRequests()

    if (!loading && !profile?.company_id) {
        return <Navigate to="/setup-company" replace />
    }

    const urgentRequests = requests?.filter(r => r.priority === 'urgent' && r.status === 'pending').slice(0, 5) || []

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/40 px-3 py-1 rounded-full w-fit border border-border/50">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Project:</span>
                        <span className="text-sm font-bold text-foreground">
                            {profile?.companies?.name || "Active Site"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-card/50 px-3 py-1.5 rounded-md border shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Sync: {format(new Date(), 'HH:mm:ss')}
                </div>
            </div>

            <StatsCards />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-card/40 backdrop-blur-md border-border/50 shadow-xl shadow-black/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold tracking-tight">Priority Monitor</CardTitle>
                            <p className="text-xs text-muted-foreground font-medium">Critical requests requiring immediate attention</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-background/50 border-primary/20 text-primary">
                            Live Feed
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {urgentRequests.length > 0 ? (
                                urgentRequests.map(request => (
                                    <div key={request.id} className="group relative flex items-center justify-between p-4 rounded-xl bg-background/40 border border-border/40 hover:border-red-500/30 hover:bg-red-500/[0.02] transition-all duration-300">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-red-500 rounded-r-full opacity-70 group-hover:h-12 transition-all duration-300" />
                                        <div className="flex items-center gap-4 pl-2">
                                            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20 shadow-inner">
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground group-hover:text-red-500 transition-colors">{request.material_name}</p>
                                                <p className="text-xs text-muted-foreground font-medium">{request.quantity} {request.unit} • <span className="text-red-500/80">Pending Action</span></p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant="destructive" className="capitalize text-[10px] font-black px-2 py-0">
                                                {request.priority}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground font-mono opacity-60">
                                                {format(new Date(request.requested_at), 'HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 opacity-70">
                                    <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 rotate-12 group hover:rotate-0 transition-transform duration-500 shadow-lg shadow-emerald-500/5">
                                        <Sparkles className="h-8 w-8 text-emerald-500 animate-pulse" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-base font-bold text-foreground">Operational Status: Nominal</p>
                                        <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">All high-priority material tracks are currently up to date.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-card/40 backdrop-blur-md border-border/50 shadow-xl shadow-black/20 overflow-hidden flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/20 bg-muted/20">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold tracking-tight">Recent Activity</CardTitle>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Workspace Event Stream</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter opacity-70 bg-background/50 border-border/50">
                            Updates
                        </Badge>
                    </CardHeader>
                    <CardContent className="flex-grow pt-6 overflow-y-auto max-h-[500px] scrollbar-hide">
                        <div className="relative space-y-0 pb-4">
                            {/* Vertical Line for Timeline */}
                            <div className="absolute left-[19px] top-2 bottom-0 w-px bg-gradient-to-b from-border/80 via-border/40 to-transparent" />

                            {requests && requests.length > 0 ? (
                                requests.slice(0, 10).map((request) => (
                                    <div key={request.id} className="relative pl-10 pb-8 group last:pb-2">
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-[15px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background ring-4 ring-background transition-all duration-300 group-hover:scale-125 z-10
                                            ${request.status === 'pending' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                request.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                    request.status === 'fulfilled' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                                                        'bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]'}`}
                                        />

                                        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/20 border border-transparent group-hover:border-border/60 group-hover:bg-muted/40 transition-all duration-300">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{request.material_name}</p>
                                                <Badge variant="outline" className={`capitalize text-[9px] h-4 font-black tracking-tight border-none px-1.5
                                                    ${request.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                        request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                            request.status === 'fulfilled' ? 'bg-blue-500/10 text-blue-500' :
                                                                'bg-slate-500/10 text-slate-500'}`}>
                                                    {request.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary ring-1 ring-primary/20">
                                                    {request.requested_by_name?.charAt(0).toUpperCase() || 'S'}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    {request.requested_by_name || 'System'}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground/30">•</span>
                                                <span className="text-[10px] text-muted-foreground/60 font-mono">
                                                    {format(new Date(request.requested_at), 'MMM dd, HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 space-y-3">
                                    <div className="h-10 w-10 rounded-full bg-muted/30 mx-auto flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-muted-foreground/40" />
                                    </div>
                                    <p className="text-xs text-muted-foreground italic font-medium px-4 leading-relaxed">No stream activity detected in this workspace yet.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
