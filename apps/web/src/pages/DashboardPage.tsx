import { Navigate } from "react-router-dom"
import { format } from "date-fns"
import { AlertCircle, Building2, Clock, CheckCircle2 } from "lucide-react"
import { StatsCards } from "@/features/dashboard/components/StatsCards"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"
import { cn, getStatusColor } from "@/lib/utils"
import { useMaterialRequests } from "@/features/requests/hooks/useMaterialRequests"

const LoadingSkeleton = () => (
    <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
        ))}
    </div>
)

export default function DashboardPage() {
    const { profile, loading } = useAuth()
    const { requests, isLoading: isRequestsLoading } = useMaterialRequests()

    if (loading) return <div className="p-8 space-y-8"><Skeleton className="h-8 w-48" /><div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-[300px] w-full" /><Skeleton className="h-[300px] w-full" /></div></div>
    if (!profile?.company_id) return <Navigate to="/setup-company" replace />

    const urgent = requests?.filter(r => r.priority === 'urgent' && r.status === 'pending').slice(0, 5) || []

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Project Overview</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium text-foreground/80">{profile?.companies?.name || "Global Workspace"}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-muted/40 px-4 py-2 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Live</span>
                    </div>
                    <div className="h-4 w-px bg-border/60" />
                    <span className="font-mono text-xs font-medium tabular-nums text-muted-foreground/70">
                        {format(new Date(), 'HH:mm')}
                    </span>
                </div>
            </header>

            <StatsCards />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
                <Card className="lg:col-span-7 border-border/60 shadow-sm bg-card/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive/80" />
                                Urgent Attention
                            </CardTitle>
                            <CardDescription className="text-xs font-medium">Pending critical material requests</CardDescription>
                        </div>
                        {urgent.length > 0 && <Badge variant="destructive" className="h-5 rounded-md px-1.5 text-[10px] uppercase font-bold">{urgent.length}</Badge>}
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isRequestsLoading ? <LoadingSkeleton /> : urgent.length > 0 ? urgent.map(r => (
                            <PriorityItem key={r.id} request={r} />
                        )) : <EmptyState icon={CheckCircle2} title="All Clear" subtitle="No urgent materials pending action." />}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-5 border-border/60 shadow-sm bg-card/30 flex flex-col">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary/80" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Live transaction stream</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow pt-2 relative overflow-hidden">
                        <div className="space-y-1 relative">
                            {isRequestsLoading ? <LoadingSkeleton /> : requests?.length ? requests.slice(0, 8).map(r => (
                                <ActivityItem key={r.id} request={r} />
                            )) : <ActivityEmptyState />}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

import type { MaterialRequestWithUser } from "@/types"

const PriorityItem = ({ request }: { request: MaterialRequestWithUser }) => (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border/50 hover:border-destructive/30 transition-colors group">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/5 flex items-center justify-center border border-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive/70" />
            </div>
            <div>
                <p className="text-sm font-semibold capitalize text-foreground/90">{request.material_name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground font-medium">
                    <span>{request.quantity} {request.unit}</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span>{format(new Date(request.requested_at), 'hh:mm a')}</span>
                </div>
            </div>
        </div>
        <Badge variant="outline" className="h-6 text-[10px] font-bold uppercase tracking-wider bg-destructive/5 text-destructive border-destructive/20">Critical</Badge>
    </div>
)

const ActivityItem = ({ request }: { request: MaterialRequestWithUser }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 px-2 rounded-lg transition-colors group">
        <div className="flex items-center gap-3">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-colors", getStatusColor(request.status, 'bg'))}>
                {request.requested_by_name?.charAt(0)}
            </div>
            <div>
                <p className="text-xs font-semibold capitalize text-foreground/90">{request.material_name}</p>
                <p className="text-[10px] font-medium text-muted-foreground/70">{request.requested_by_name?.split(' ')[0]}</p>
            </div>
        </div>
        <div className="text-right">
            <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", getStatusColor(request.status, 'badge'))}>
                {request.status}
            </span>
            <p className="text-[10px] text-muted-foreground/50 font-medium mt-1 uppercase tracking-tighter">
                {format(new Date(request.requested_at), 'HH:mm')}
            </p>
        </div>
    </div>
)

const EmptyState = ({ icon: Icon, title, subtitle }: { icon: React.ElementType, title: string, subtitle: string }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground/50">
        <Icon className="h-10 w-10 mb-4 opacity-40" />
        <p className="text-xs font-bold uppercase tracking-widest">{title}</p>
        <p className="text-[10px] mt-1 font-medium max-w-[180px]">{subtitle}</p>
    </div>
)

const ActivityEmptyState = () => (
    <div className="text-center py-12 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">
        No recent transactions
    </div>
)
