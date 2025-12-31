import { useState, useMemo } from "react"
import { format } from "date-fns"
import { PackageOpen, Search, Download } from "lucide-react"
import { useMaterialRequests } from "@/features/requests/hooks/useMaterialRequests"
import { Input } from "@/components/ui/form-controls"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function MaterialRequestsList() {
    const { requests, isLoading } = useMaterialRequests()
    const [q, setQ] = useState(""); const [st, setSt] = useState("all")

    const filtered = useMemo(() => (requests || []).filter(r => (st === "all" || r.status === st) && r.material_name.toLowerCase().includes(q.toLowerCase())), [requests, st, q])

    const exportCSV = () => {
        const h = "Material,Qty,Unit,Status,Date\n", b = filtered.map(r => `${r.material_name},${r.quantity},${r.unit},${r.status},${r.requested_at}`).join("\n")
        const url = URL.createObjectURL(new Blob([h + b], { type: 'text/csv' }))
        const a = document.createElement('a'); a.href = url; a.download = `req_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url)
    }

    if (isLoading) return <div className="space-y-4"><Skeleton className="h-12 w-full" />{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full opacity-40" />)}</div>
    if (!requests?.length && !q && st === "all") return <div className="py-24 text-center border-2 border-dashed rounded-3xl opacity-40"><PackageOpen className="h-10 w-10 mx-auto mb-2" /><p className="text-xs font-bold uppercase tracking-widest">Archive Empty</p></div>

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full text-foreground">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                    <Input placeholder="Search materials..." className="pl-10 h-10 bg-background" value={q} onChange={e => setQ(e.target.value)} />
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
                            <TableHead className="text-xs font-bold uppercase text-center">Volume</TableHead>
                            <TableHead className="text-xs font-bold uppercase">Criticality</TableHead>
                            <TableHead className="text-xs font-bold uppercase pr-6">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map(r => (
                            <TableRow key={r.id} className="group hover:bg-muted/15 border-border/40 transition-colors">
                                <TableCell className="pl-6 py-4">
                                    <p className="font-semibold text-sm capitalize">{r.material_name}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">{format(new Date(r.requested_at), 'MMM dd, HH:mm')}</p>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="font-bold text-sm tracking-tight">{r.quantity}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase ml-1">{r.unit}</span>
                                </TableCell>
                                <TableCell><Badge variant={r.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md">{r.priority}</Badge></TableCell>
                                <TableCell className="pr-6">
                                    <Badge variant="outline" className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border-border/60
                                        ${r.status === 'pending' ? 'text-amber-600 bg-amber-500/5' :
                                            r.status === 'approved' ? 'text-emerald-600 bg-emerald-500/5' :
                                                r.status === 'rejected' ? 'text-red-900 bg-red-500/5' : 'text-blue-600 bg-blue-500/5'}`}>
                                        {r.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
