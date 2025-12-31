import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Building2, Plus, Loader2, ChevronsUpDown, Sparkles } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

const DEMO_ID = '00000000-0000-0000-0000-000000000001'

export function WorkspaceSwitcher() {
    const { user, profile, refreshProfile } = useAuth()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const location = useLocation()
    const { toast } = useToast()

    const { data: workspaces = [], isLoading: fetching } = useQuery({
        queryKey: ['workspaces', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase.from("companies").select("id, name").order("name")
            if (error) return []
            return data.map(w => w.id === DEMO_ID ? { ...w, name: "Demo Workspace" } : w)
        },
        enabled: !!user,
        staleTime: 300000,
    })

    const onSwitch = async (id: string) => {
        if (id === "new") return navigate("/setup-company")
        if (id === profile?.company_id) return location.pathname === "/setup-company" && navigate("/dashboard")

        try {
            await supabase.from("profiles").update({ company_id: id }).eq("id", user?.id)
            await refreshProfile()
            queryClient.invalidateQueries({ queryKey: ['material-requests'] })
            toast({ title: "Workspace Switched", description: `You are now in ${workspaces.find(w => w.id === id)?.name}` })
            navigate("/dashboard", { replace: true })
        } catch (e) {
            toast({ variant: "destructive", title: "Error switching workspace" })
        }
    }

    if (!user) return null
    const active = workspaces.find(w => w.id === profile?.company_id)

    return (
        <div className="flex items-center gap-2">
            <Select value={profile?.company_id ?? ""} onValueChange={onSwitch} disabled={fetching}>
                <SelectTrigger className="w-[180px] h-9 bg-muted/40 border-border/60 hover:bg-muted/60 transition-colors rounded-lg px-2 group shrink-0">
                    <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-2 truncate">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
                                <Building2 className="h-3 w-3" />
                            </div>
                            <span className="truncate text-xs font-semibold text-foreground/80">
                                {active?.name || "Select Workspace"}
                            </span>
                        </div>
                        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    </div>
                </SelectTrigger>
                <SelectContent align="start" className="w-[240px] p-1.5 shadow-xl border-border/60">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                        Workspaces
                    </div>

                    <div className="space-y-0.5 mt-1">
                        {workspaces.map((w) => (
                            <SelectItem key={w.id} value={w.id} className="text-xs font-medium cursor-pointer rounded-md py-2.5">
                                <div className="flex items-center gap-2">
                                    {w.id === DEMO_ID ? <Sparkles className="h-3 w-3 text-primary/60" /> : <Building2 className="h-3.5 w-3.5 text-muted-foreground/40" />}
                                    {w.name}
                                </div>
                            </SelectItem>
                        ))}
                    </div>

                    <div className="h-px bg-border/40 my-1.5" />

                    <SelectItem value="new" className="text-xs font-semibold text-primary cursor-pointer hover:bg-primary/5 py-2.5 rounded-md">
                        <div className="flex items-center gap-2">
                            <Plus className="h-3.5 w-3.5" />
                            New Workspace
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
            {fetching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/40" />}
        </div>
    )
}
