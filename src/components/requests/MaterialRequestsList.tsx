import { useState, useMemo } from "react"
import { format } from "date-fns"
import { PackageOpen, Sparkles, Search, Download } from "lucide-react"

import { useMaterialRequests } from "@/hooks/useMaterialRequests"
import { type MaterialRequest } from "@/types"

import { Input } from "@/components/ui/form-controls"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function MaterialRequestsList() {
    const { requests, isLoading, updateStatus, isUpdating } = useMaterialRequests()
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")

    // Pending state for optimistic UI updates or confirmation dialogs
    const [targetStatusChange, setTargetStatusChange] = useState<{ id: string, status: MaterialRequest['status'] } | null>(null)

    const activeRequests = useMemo(() => {
        if (!requests) return []
        return requests.filter(req => {
            const matchesStatus = statusFilter === "all" || req.status === statusFilter
            const matchesSearch = req.material_name.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesStatus && matchesSearch
        })
    }, [requests, statusFilter, searchQuery])

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-card/40 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            {/* Skeleton headers matching the column layout */}
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i} className="hover:bg-transparent">
                                <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    if (!requests?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center border rounded-2xl border-dashed bg-muted/30">
                <div className="rounded-full bg-primary/10 p-5 mb-4 ring-1 ring-inset ring-primary/20">
                    <PackageOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">No Requests Found</h3>
                <p className="text-muted-foreground mt-2 max-w-sm text-balance">
                    Manage your construction supply chain here. Start by creating a new material request.
                </p>
            </div>
        )
    }

    const handleStatusChange = (id: string, newStatus: string) => {
        setTargetStatusChange({ id, status: newStatus as MaterialRequest['status'] })
    }

    const confirmStatusChange = () => {
        if (targetStatusChange) {
            updateStatus(targetStatusChange)
                .catch(err => console.error("Failed to update status", err))
                .finally(() => setTargetStatusChange(null))
        }
    }

    const exportToCSV = () => {
        if (!activeRequests.length) return

        const headers = ["Material", "Quantity", "Unit", "Priority", "Status", "Requested By", "Date", "Notes"]
        const csvRows = [headers.join(",")]

        activeRequests.forEach(req => {
            const row = [
                `"${req.material_name.replace(/"/g, '""')}"`,
                req.quantity,
                req.unit,
                req.priority,
                req.status,
                req.requested_by_name, // Updated to use the joined name
                format(new Date(req.requested_at), 'yyyy-MM-dd'),
                `"${(req.notes || "").replace(/"/g, '""')}"`
            ]
            csvRows.push(row.join(","))
        })

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `material_requests_${format(new Date(), 'yyyyMMdd')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-card/60 backdrop-blur-xl p-4 rounded-2xl border shadow-sm">
                <div className="flex-1 flex flex-col md:flex-row gap-3 w-full">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <Input
                            aria-label="Search material requests"
                            placeholder="Search by material..."
                            className="pl-10 h-10 bg-background/50 border-border/60 focus-visible:ring-primary/30"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[200px] h-10 bg-background/50 border-border/60" aria-label="Filter by status">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="fulfilled">Fulfilled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" onClick={exportToCSV} className="h-10 px-6 font-semibold" disabled={!activeRequests.length}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-border/60">
                            <TableHead className="w-[30%] font-bold py-4 pl-6">Material</TableHead>
                            <TableHead className="font-bold">Quantity</TableHead>
                            <TableHead className="font-bold">Priority</TableHead>
                            <TableHead className="font-bold">Requester</TableHead>
                            <TableHead className="font-bold">Submitted</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="text-right font-bold pr-6">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activeRequests.length > 0 ? (
                            activeRequests.map((request) => (
                                <TableRow key={request.id} className="group transition-colors hover:bg-muted/40 border-border/60">
                                    <TableCell className="py-3 pl-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-foreground text-sm">{request.material_name}</span>
                                                {request.notes?.includes('Detected') && (
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 text-[9px] font-bold text-blue-600">
                                                        <Sparkles className="h-2 w-2" />
                                                        <span>AI</span>
                                                    </div>
                                                )}
                                            </div>
                                            {request.notes && (
                                                <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                                                    {request.notes}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-mono font-bold text-lg">{request.quantity}</span>
                                            <span className="text-xs text-muted-foreground font-medium uppercase">{request.unit}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge type="priority" value={request.priority} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                {request.requested_by_name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <span className="truncate max-w-[120px]">{request.requested_by_name || 'System'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(request.requested_at), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge type="status" value={request.status} />
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Select
                                            value={request.status}
                                            onValueChange={(val) => handleStatusChange(request.id, val)}
                                            disabled={isUpdating}
                                        >
                                            <SelectTrigger aria-label="Update request status" className="w-[110px] h-8 text-xs font-bold bg-muted/40 border-transparent hover:bg-muted ml-auto transition-all">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent align="end" className="shadow-xl border-border/60">
                                                <SelectItem value="pending" className="text-xs font-medium">Pending</SelectItem>
                                                <SelectItem value="approved" className="text-xs font-medium">Approve</SelectItem>
                                                <SelectItem value="rejected" className="text-xs font-medium text-destructive focus:text-destructive">Reject</SelectItem>
                                                <SelectItem value="fulfilled" className="text-xs font-medium">Fulfill</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                                    No material requests match your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!targetStatusChange} onOpenChange={() => setTargetStatusChange(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
                        <AlertDialogDescription>
                            Marking this request as <span className="font-bold text-foreground capitalize">{targetStatusChange?.status}</span> will update the workflow status for all users.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmStatusChange} className="bg-primary font-bold">
                            Confirm Update
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function StatusBadge({ type, value }: { type: 'priority' | 'status', value: string }) {
    if (type === 'priority') {
        const isUrgent = value === 'urgent'
        return (
            <Badge variant={isUrgent ? 'destructive' : 'secondary'} className={`capitalize ${!isUrgent && 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {value}
            </Badge>
        )
    }

    const colors: Record<string, string> = {
        approved: 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20',
        rejected: 'bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 border-rose-500/20',
        fulfilled: 'bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/20',
        pending: 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/20',
    }

    return (
        <Badge variant="outline" className={`${colors[value] || 'bg-gray-100'} capitalize border px-2.5 py-0.5 shadow-none`}>
            {value}
        </Badge>
    )
}
