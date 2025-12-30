import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select"
import { Building2, Plus, Loader2, ChevronsUpDown, Sparkles } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001'

export function WorkspaceSwitcher() {
    const { user, profile, refreshProfile } = useAuth()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const location = useLocation()
    const { toast } = useToast()

    // Optimized fetching with React Query (instantly cached)
    const { data: workspaces = [], isLoading: isFetching } = useQuery({
        queryKey: ['workspaces', user?.id],
        queryFn: async () => {
            if (!user) return []

            try {
                // RLS policies already filter visible companies (Created by user OR Demo OR Joined)
                const { data, error } = await supabase
                    .from("companies")
                    .select("id, name")
                    .order("name")

                if (error) {
                    console.warn("Workspace fetch warning:", error.message)
                    // If RLS blocks access, just return empty list instead of crashing
                    return []
                }
                return data.map(w => w.id === DEMO_COMPANY_ID ? { ...w, name: "Demo Site Alpha" } : w)
            } catch (err) {
                return []
            }
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    }) as { data: { id: string; name: string }[]; isLoading: boolean }

    const handleSwitch = async (id: string) => {
        if (id === "new") {
            navigate("/setup-company")
            return
        }

        if (id === profile?.company_id) {
            if (location.pathname === "/setup-company") {
                navigate("/dashboard")
            }
            return
        }

        try {
            const { error } = await supabase
                .from("profiles")
                .update({ company_id: id })
                .eq("id", user?.id)

            if (error) throw error

            // 1. Refresh profile first so the company name and ID are updated globally
            await refreshProfile()

            // 2. Clear cache so Dashboard re-fetches data for the NEW company
            queryClient.invalidateQueries({ queryKey: ['material-requests'] })

            toast({
                title: "Switched Workspace",
                description: `Now viewing ${workspaces.find(w => w.id === id)?.name || "Project"}`,
            })

            // 3. Force navigation to dashboard to ensure fresh state
            navigate("/dashboard", { replace: true })
        } catch (error) {
            console.error("Workspace switch failed:", error)
            toast({
                variant: "destructive",
                title: "Switch Failed",
                description: "Could not update active workspace.",
            })
        }
    }

    if (!user) return null

    const currentWorkspaceName = workspaces.find(w => w.id === profile?.company_id)?.name

    return (
        <div className="flex items-center gap-2">
            <Select
                value={profile?.company_id ?? ""}
                onValueChange={handleSwitch}
                disabled={isFetching}
            >
                <SelectTrigger className="w-[180px] h-9 bg-muted/20 border border-border/40 shadow-none text-xs font-bold hover:bg-muted/40 hover:border-border transition-all focus:ring-0 rounded-xl px-3 group">
                    <div className="flex items-center justify-between w-full gap-2 font-mono">
                        <div className="flex items-center gap-2 truncate">
                            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <Building2 className="h-3 w-3" />
                            </div>
                            <span className="truncate max-w-[110px] tracking-tight">
                                {currentWorkspaceName || "Select Workspace"}
                            </span>
                        </div>
                        <ChevronsUpDown className="h-3 w-3 opacity-30 shrink-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </SelectTrigger>
                <SelectContent align="start" className="w-[240px] shadow-2xl border-border/50 backdrop-blur-xl">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                        Workspaces
                    </div>

                    {workspaces.length > 0 ? (
                        <div className="space-y-0.5">
                            {workspaces.map((workspace) => (
                                <SelectItem
                                    key={workspace.id}
                                    value={workspace.id}
                                    className="text-xs cursor-pointer focus:bg-primary/10"
                                >
                                    <div className="flex items-center gap-2">
                                        {workspace.id === DEMO_COMPANY_ID && <Sparkles className="h-3 w-3 text-blue-500" />}
                                        {workspace.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </div>
                    ) : (
                        <div className="py-4 px-2 text-[11px] text-muted-foreground italic text-center opacity-60 font-medium">
                            No projects found.
                        </div>
                    )}

                    <div className="h-px bg-border/50 my-1" />

                    <SelectItem
                        value="new"
                        className="text-xs text-primary font-bold cursor-pointer hover:bg-primary/5 focus:bg-primary/5"
                    >
                        <div className="flex items-center gap-2">
                            <Plus className="h-3 w-3" />
                            Create New Workspace
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
            {isFetching && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-1" />}
        </div>
    )
}
