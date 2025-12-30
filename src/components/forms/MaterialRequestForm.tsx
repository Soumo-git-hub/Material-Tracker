import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Camera, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input, Textarea } from "@/components/ui/form-controls"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useMaterialRequests, type NewMaterialRequest } from "@/hooks/useMaterialRequests"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    material_name: z.string().min(2, {
        message: "Two characters minimum.",
    }),
    quantity: z.number().positive({
        message: "Must be positive.",
    }),
    unit: z.string().min(1, {
        message: "Required.",
    }),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function MaterialRequestForm({ onSuccess }: { onSuccess?: () => void }) {
    const { createRequest } = useMaterialRequests()
    const { toast } = useToast()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isVisionProcessing, setIsVisionProcessing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            material_name: "",
            quantity: 1,
            unit: "pieces",
            priority: "medium",
            notes: "",
        },
    })

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true)
        try {
            const payload: NewMaterialRequest = {
                material_name: values.material_name,
                quantity: values.quantity,
                unit: values.unit,
                priority: values.priority,
                notes: values.notes,
                status: "pending",
            }

            await createRequest(payload)

            toast({
                title: "Request Submitted",
                description: "Your material request has been queued for approval.",
            })
            form.reset()
            onSuccess?.()
        } catch (error) {
            console.error("Failed to submit material request:", error)
            toast({
                title: "Submission Failed",
                description: "Could not create request. Please check your connection and try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsVisionProcessing(true)
        toast({
            title: "Processing Image...",
            description: "Analyzing site photo for material estimation.",
        })

        // Simulated Vision API latency
        const processingTime = 1500 + Math.random() * 1500

        setTimeout(() => {
            // Logic: Randomize the mock result slightly to feel less static
            const confidence = (0.85 + Math.random() * 0.14).toFixed(2) // 0.85 - 0.99

            form.setValue("material_name", "Cured Concrete Blocks")
            form.setValue("quantity", Math.floor(40 + Math.random() * 20)) // 40-60
            form.setValue("unit", "pieces")
            form.setValue("priority", "high")
            form.setValue("notes", `Detected from site photo (Confidence: ${confidence}). Verify count before approval.`)

            setIsVisionProcessing(false)
            toast({
                title: "Analysis Complete",
                description: `Identified materials with ${Number(confidence) * 100}% confidence.`,
                className: "border-blue-500/30 bg-blue-500/10",
            })

            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }, processingTime)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="flex justify-end">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isVisionProcessing}
                        className={cn(
                            "relative overflow-hidden transition-all",
                            isVisionProcessing ? "bg-muted text-muted-foreground" : "hover:border-primary/50 hover:text-primary"
                        )}
                    >
                        {isVisionProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Analyzing Scene...</span>
                            </>
                        ) : (
                            <>
                                <Camera className="mr-2 h-4 w-4" />
                                <span>Auto-fill from Photo</span>
                                <Sparkles className="ml-2 h-3 w-3 text-amber-500" />
                            </>
                        )}
                    </Button>
                </div>

                <FormField
                    control={form.control}
                    name="material_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Material Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Portland Cement" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(e.target.valueAsNumber)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="pieces">Pieces</SelectItem>
                                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                        <SelectItem value="bags">Bags</SelectItem>
                                        <SelectItem value="m">Meters (m)</SelectItem>
                                        <SelectItem value="m2">Square Meters (m²)</SelectItem>
                                        <SelectItem value="m3">Cubic Meters (m³)</SelectItem>
                                        <SelectItem value="liters">Liters</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent" className="text-destructive font-bold">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Any additional context..."
                                    className="resize-none min-h-[80px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Material Request
                </Button>
            </form>
        </Form>
    )
}
