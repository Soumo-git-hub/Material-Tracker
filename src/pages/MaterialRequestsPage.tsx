import { MaterialRequestForm } from "@/components/forms/MaterialRequestForm"
import { MaterialRequestsList } from "@/components/requests/MaterialRequestsList"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"

export default function MaterialRequestsPage() {
    const { profile, loading } = useAuth()
    const [open, setOpen] = useState(false)

    // Double-check security: Eject if no company
    if (!loading && !profile?.company_id) {
        return <Navigate to="/setup-company" replace />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Material Requests</h1>
                    <p className="text-muted-foreground">Manage and track on-site material needs.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> New Request</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Material Request</DialogTitle>
                            <DialogDescription>
                                Submit a new request for materials to be approved.
                            </DialogDescription>
                        </DialogHeader>
                        <MaterialRequestForm onSuccess={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <MaterialRequestsList />
            <Toaster />
        </div>
    )
}
