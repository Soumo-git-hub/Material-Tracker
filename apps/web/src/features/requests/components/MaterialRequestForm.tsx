import { useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input, Textarea } from "@/components/ui/form-controls"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useMaterialRequests } from "@/features/requests/hooks/useMaterialRequests"
import { useMaterialScanner } from "@/features/requests/hooks/useMaterialScanner"

const schema = z.object({
    material_name: z.string().min(2, "Required"),
    quantity: z.number().positive("Positive only"),
    unit: z.string().min(1, "Required"),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    notes: z.string().optional(),
})

// MaterialRequestForm.tsx continues...

export type RequestFormProps = {
    onSuccess?: () => void
    initialData?: any
    mode?: 'create' | 'edit'
}

export function MaterialRequestForm({ onSuccess, initialData, mode = 'create' }: RequestFormProps) {
    const { createRequest, updateRequest, isCreating, isEditing } = useMaterialRequests()
    const { toast } = useToast()
    const fileRef = useRef<HTMLInputElement>(null)
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: initialData ? {
            material_name: initialData.material_name,
            quantity: Number(initialData.quantity),
            unit: initialData.unit,
            priority: initialData.priority,
            notes: initialData.notes || ""
        } : { material_name: "", quantity: 1, unit: "pieces", priority: "medium", notes: "" }
    })

    const onScanComplete = (data: any) => {
        form.reset({
            material_name: data.material_name || "New Material",
            quantity: Number(data.quantity) || 1,
            unit: ['pieces', 'kg', 'bags', 'm3', 'liters'].includes(data.unit) ? data.unit : "pieces",
            priority: ['low', 'medium', 'high', 'urgent'].includes(data.priority) ? data.priority : "medium",
            notes: data.notes || "Auto-extracted via Smart Scan."
        })
    }

    const { scanDocument, scanning } = useMaterialScanner({ onScanComplete })

    const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) scanDocument(file)
        if (fileRef.current) fileRef.current.value = ""
    }

    const onSubmit = async (v: z.infer<typeof schema>) => {
        try {
            if (mode === 'edit' && initialData?.id) {
                await updateRequest({ id: initialData.id, updates: v })
                toast({ title: "Request Updated" })
            } else {
                await createRequest(v)
                toast({ title: "Request Submitted" })
                form.reset()
            }
            onSuccess?.()
        } catch (error) {
            toast({ variant: "destructive", title: "Action Failed" })
        }
    }

    const isBusy = isCreating || isEditing

    return (
        <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'create' && (
                <>
                    <input type="file" hidden ref={fileRef} onChange={onImageUpload} accept="image/*" />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileRef.current?.click()}
                        disabled={scanning}
                        className="w-full h-12 text-xs font-bold gap-3 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all border-dashed"
                    >
                        {scanning ? (
                            <span className="animate-pulse text-primary tracking-widest">OPTIMIZING...</span>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 text-primary" />
                                SMART SCAN DOCUMENT
                            </>
                        )}
                    </Button>
                </>
            )}
            <div className="space-y-3">
                <FormField control={form.control} name="material_name" render={({ field }) => (<FormItem><FormLabel className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Material Name</FormLabel><FormControl><Input placeholder="e.g. Structural Steel" className="h-10 text-sm" {...field} /></FormControl><FormMessage className="text-[10px]" /></FormItem>)} />
                <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Quantity</FormLabel><FormControl><Input type="number" className="h-10 text-sm" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="unit" render={({ field }) => (<FormItem><FormLabel className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Unit</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger></FormControl><SelectContent>{['pieces', 'kg', 'bags', 'm3', 'liters'].map(u => <SelectItem key={u} value={u} className="text-xs font-medium py-2 capitalize">{u}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                </div>
                <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Priority Level</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger></FormControl><SelectContent>{['low', 'medium', 'high', 'urgent'].map(p => <SelectItem key={p} value={p} className="text-xs font-medium py-2 capitalize">{p}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Extraction Notes</FormLabel><FormControl><Textarea className="min-h-[90px] text-sm resize-none leading-relaxed" placeholder="Notes from document scan..." {...field} /></FormControl></FormItem>)} />
            </div>
            <Button type="submit" className="w-full h-11 text-xs font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.01]" disabled={isBusy}>
                {isBusy ? <span className="animate-pulse tracking-widest">{mode === 'edit' ? "UPDATING..." : "SENDING..."}</span> : (mode === 'edit' ? "UPDATE REQUEST" : "SUBMIT MATERIAL REQUEST")}
            </Button>
        </form></Form>
    )
}
