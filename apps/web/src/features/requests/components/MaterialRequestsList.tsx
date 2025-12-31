import { useState, useMemo } from "react"
import { format } from "date-fns"
import { PackageOpen, Search, Download, Pencil, AlertTriangle, ArrowUp, Minus } from "lucide-react"
import { useMaterialRequests } from "@/features/requests/hooks/useMaterialRequests"
import { Input } from "@/components/ui/form-controls"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { useToast } from "@/hooks/use-toast"
import { cn, getStatusColor } from "@/lib/utils"
import type { RequestStatus } from "@/types"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { MaterialRequestForm } from "./MaterialRequestForm"


export function MaterialRequestsList() {
    const { requests, isLoading, updateStatus, isUpdating } = useMaterialRequests()
    const { toast } = useToast()
    const [q, setQ] = useState("")
    const [st, setSt] = useState("all")
    const [selectedRequest, setSelectedRequest] = useState<{ id: string, newStatus: RequestStatus } | null>(null)
    const [editingRequest, setEditingRequest] = useState<any>(null)

    const filtered = useMemo(() => (requests || []).filter(r =>
        (st === "all" || r.status === st) &&
        (r.material_name.toLowerCase().includes(q.toLowerCase()) || r.requested_by_name.toLowerCase().includes(q.toLowerCase()))
    ), [requests, st, q])

    const exportCSV = () => {
        const header = "Material Name,Quantity,Unit,Status,Priority,Requested By,Date\n"
        const rows = filtered.map(r =>
            `"${r.material_name}",${r.quantity},${r.unit},${r.status},${r.priority},"${r.requested_by_name}",${r.requested_at}`
        ).join("\n")

        const url = URL.createObjectURL(new Blob([header + rows], { type: 'text/csv' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `material_requests_${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleStatusChange = (id: string, newStatus: RequestStatus) => {
        setSelectedRequest({ id, newStatus })
    }

    const confirmStatusUpdate = async () => {
        if (!selectedRequest) return
        try {
            await updateStatus({ id: selectedRequest.id, status: selectedRequest.newStatus })
            toast({ title: "Status Updated", description: `Request marked as ${selectedRequest.newStatus}` })
        } catch {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not update status." })
        } finally {
            setSelectedRequest(null)
        }
    }

    const getPriorityIcon = (p: string) => {
        if (p === 'urgent') return <AlertTriangle className="h-3 w-3" />
        if (p === 'high') return <ArrowUp className="h-3 w-3" />
        return <Minus className="h-3 w-3 opacity-50" />
    }

    // Determine content to show in table body
    let content;
    if (isLoading) {
        content = [...Array(5)].map((_, i) => (
            <TableRow key={i} className="border-border/40">
                <TableCell className="pl-6 py-4"><Skeleton className="h-4 w-[140px] mb-1" /><Skeleton className="h-3 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full inline-block mr-2" /><Skeleton className="h-4 w-[100px] inline-block" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-[60px] mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                <TableCell className="pr-6"><Skeleton className="h-7 w-[110px]" /></TableCell>
            </TableRow>
        ))
    } else if (filtered.length === 0) {
        content = (
            <TableRow>
                <TableCell colSpan={6} className="h-[300px] text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                        <PackageOpen className="h-10 w-10 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">
                            {q || st !== 'all' ? "No Matches Found" : "Archive Empty"}
                        </p>
                    </div>
                </TableCell>
            </TableRow>
        )
    } else {
        content = filtered.map(r => (
            <TableRow key={r.id} className="group hover:bg-muted/15 border-border/40 transition-colors">
                <TableCell className="pl-6 py-4">
                    <p className="font-semibold text-sm capitalize">{r.material_name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{format(new Date(r.requested_at), 'MMM dd, HH:mm')}</p>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {r.requested_by_name?.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{r.requested_by_name}</span>
                    </div>
                </TableCell>
                <TableCell className="text-center">
                    <span className="font-bold text-sm tracking-tight">{r.quantity}</span>
                    <span className="text-[10px] text-muted-foreground uppercase ml-1">{r.unit}</span>
                </TableCell>
                <TableCell>
                    <Badge variant={r.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shadow-none">
                        <span className="mr-1">{getPriorityIcon(r.priority)}</span>
                        {r.priority}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Select value={r.status} onValueChange={(val) => handleStatusChange(r.id, val as RequestStatus)}>
                        <SelectTrigger className={cn(`h-7 text-[10px] font-bold uppercase px-2 rounded-md border w-[110px]`, getStatusColor(r.status, 'badge'))}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending" className="text-amber-600 font-medium text-xs">Pending</SelectItem>
                            <SelectItem value="approved" className="text-emerald-600 font-medium text-xs">Approved</SelectItem>
                            <SelectItem value="fulfilled" className="text-blue-600 font-medium text-xs">Fulfilled</SelectItem>
                            <SelectItem value="rejected" className="text-red-900 font-medium text-xs">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </TableCell>
                <TableCell className="pr-6 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditingRequest(r)}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                </TableCell>
            </TableRow>
        ))
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full text-foreground">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                    <Input placeholder="Search materials or requester..." className="pl-10 h-10 bg-background" value={q} onChange={e => setQ(e.target.value)} />
                </div>
                <Select value={st} onValueChange={setSt}>
                    <SelectTrigger className="w-full md:w-[150px] h-10 font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent>{['all', 'pending', 'approved', 'rejected', 'fulfilled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="outline" onClick={exportCSV} className="h-10 px-4 font-medium"><Download className="h-4 w-4 mr-2" /> Export</Button>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="border-border/60">
                            <TableHead className="text-xs font-bold uppercase pl-6 py-4">Request Log</TableHead>
                            <TableHead className="text-xs font-bold uppercase">Requested By</TableHead>
                            <TableHead className="text-xs font-bold uppercase text-center">Volume</TableHead>
                            <TableHead className="text-xs font-bold uppercase">Criticality</TableHead>
                            <TableHead className="text-xs font-bold uppercase">Status</TableHead>
                            <TableHead className="text-xs font-bold uppercase pr-6 text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {content}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!selectedRequest} onOpenChange={(open: boolean) => { if (!open) setSelectedRequest(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Status?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change the status of this request to <span className="font-bold uppercase text-foreground">{selectedRequest?.newStatus}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmStatusUpdate} disabled={isUpdating}>
                            {isUpdating ? "Updating..." : "Confirm Update"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Sheet open={!!editingRequest} onOpenChange={(open: boolean) => { if (!open) setEditingRequest(null) }}>
                <SheetContent className="w-full sm:w-[540px]">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Edit Request</SheetTitle>
                        <SheetDescription>Modify the details of this material request.</SheetDescription>
                    </SheetHeader>
                    {editingRequest && (
                        <MaterialRequestForm
                            mode="edit"
                            initialData={editingRequest}
                            onSuccess={() => setEditingRequest(null)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
