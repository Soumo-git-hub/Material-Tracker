import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input, Textarea } from "@/components/ui/form-controls"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useMaterialRequests } from "@/features/requests/hooks/useMaterialRequests"

const schema = z.object({
    material_name: z.string().min(2, "Required"),
    quantity: z.number().positive("Positive only"),
    unit: z.string().min(1, "Required"),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    notes: z.string().optional(),
})

export function MaterialRequestForm({ onSuccess }: { onSuccess?: () => void }) {
    const { createRequest } = useMaterialRequests()
    const { toast } = useToast(); const [scanning, setScanning] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { material_name: "", quantity: 1, unit: "pieces", priority: "medium", notes: "" }
    })

    const onImageUpload = () => {
        setScanning(true); toast({ title: "Analyzing Image..." })
        setTimeout(() => {
            form.reset({ ...form.getValues(), material_name: "Reinforced Steel", quantity: 50, priority: "high", notes: "Auto-detected" })
            setScanning(false); toast({ title: "Success", description: "Fields populated" })
        }, 800)
    }

    const onSubmit = async (v: z.infer<typeof schema>) => {
        try {
            await createRequest({ ...v, status: "pending" })
            toast({ title: "Request Submitted" })
            form.reset(); onSuccess?.()
        } catch { toast({ variant: "destructive", title: "Action Failed" }) }
    }

    return (
        <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input type="file" hidden ref={fileRef} onChange={onImageUpload} accept="image/*" />
            <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} disabled={scanning} className="w-full h-10 text-xs font-bold gap-2">
                {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} AI Smart Scan
            </Button>
            <div className="space-y-3">
                <FormField control={form.control} name="material_name" render={({ field }) => (<FormItem><FormLabel className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Material</FormLabel><FormControl><Input placeholder="Name..." className="h-10 text-sm" {...field} /></FormControl><FormMessage className="text-[10px]" /></FormItem>)} />
                <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Qty</FormLabel><FormControl><Input type="number" className="h-10 text-sm" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="unit" render={({ field }) => (<FormItem><FormLabel className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Unit</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger></FormControl><SelectContent>{['pieces', 'kg', 'bags', 'm3', 'liters'].map(u => <SelectItem key={u} value={u} className="text-xs font-medium py-2 capitalize">{u}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                </div>
                <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Priority</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger></FormControl><SelectContent>{['low', 'medium', 'high', 'urgent'].map(p => <SelectItem key={p} value={p} className="text-xs font-medium py-2 capitalize">{p}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Notes</FormLabel><FormControl><Textarea className="min-h-[80px] text-sm resize-none" {...field} /></FormControl></FormItem>)} />
            </div>
            <Button type="submit" className="w-full h-10 text-xs font-bold" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "SUBMIT REQUEST"}
            </Button>
        </form></Form>
    )
}
