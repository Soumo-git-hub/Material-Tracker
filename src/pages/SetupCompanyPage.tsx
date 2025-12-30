import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/form-controls"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, PlusCircle, Sparkles, Building2, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function SetupCompanyPage() {
    const { user, refreshProfile, loading: authLoading } = useAuth()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { toast } = useToast()

    const [companyName, setCompanyName] = useState("")
    const [joinId, setJoinId] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Demo Company ID
    const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001'

    const handleCreateCompany = async () => {
        if (!companyName.trim() || !user) return
        setIsLoading(true)
        try {
            const { data: company, error: companyError } = await supabase
                .from("companies")
                .insert([{ name: companyName, created_by: user.id }])
                .select()
                .single()

            if (companyError) throw companyError

            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    company_id: company.id,
                    role: "admin"
                })

            if (profileError) throw profileError

            toast({
                title: "New Workspace Ready",
                description: `Successfully initialized "${companyName}".`,
            })
            queryClient.invalidateQueries({ queryKey: ['workspaces', user.id] })
            await refreshProfile()
            navigate("/dashboard", { replace: true })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Setup Failed",
                description: "Failed to create workspace. Try again later.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleJoinCompany = async () => {
        if (!joinId.trim()) return

        setIsLoading(true)
        try {
            // DIRECT JOIN: We skip checking if the company exists via SELECT because 
            // RLS policies often hide company details from users who aren't members yet.
            // Attempts to query it would fail with 406 (Not Acceptable) because of 0 rows returned.
            // Instead, we try to update the profile directly. If the ID is invalid, 
            // the database Foreign Key constraint will throw an error, which we catch.

            const { error: updateError } = await supabase
                .from("profiles")
                .upsert({
                    id: user?.id,
                    company_id: joinId, // Try to link directly
                    role: 'foreman'
                })

            if (updateError) {
                // Check if it's a Foreign Key violation (invalid ID)
                // Postgres error code 23503 is FK violation
                if (updateError.code === '23503') {
                    throw new Error("Invalid Workspace ID. Please verify and try again.")
                }
                throw updateError
            }

            await refreshProfile()
            navigate("/dashboard", { replace: true })
        } catch (error: any) {
            console.error("Join error:", error)
            toast({
                variant: "destructive",
                title: "Join Failed",
                description: error.message || "Could not join workspace."
            })
        } finally {
            setIsLoading(false)
        }
    }

    const joinDemo = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    company_id: DEMO_COMPANY_ID,
                    role: "employee"
                })

            if (error) throw error

            toast({ title: "Demo Mode Active", description: "You have joined 'Demo Site Alpha'." })
            queryClient.invalidateQueries({ queryKey: ['workspaces', user.id] })
            await refreshProfile()
            navigate("/dashboard", { replace: true })
        } catch (error) {
            toast({ variant: "destructive", title: "Join Failed", description: "Could not join demo." })
        } finally {
            setIsLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="relative flex min-h-[85vh] flex-col items-center justify-center p-4">

            {/* Design Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

            <div className="z-10 w-full max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-3">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">Get Started with tracking</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Create your own private workspace or jump into our live demo to see how it works.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    {/* Create or Join Card */}
                    <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl flex flex-col hover:border-primary/20 transition-all duration-500">
                        <CardHeader>
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                                <PlusCircle className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Start Tracking</CardTitle>
                            <CardDescription>Create a new workspace or join an existing one.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 flex-grow">
                            {/* Create New Section */}
                            <div className="space-y-2">
                                <Label htmlFor="workspace-name" className="text-sm font-semibold">New Workspace Name</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="workspace-name"
                                        placeholder="e.g. Skyline Bridge Project"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        disabled={isLoading}
                                        className="h-10 bg-background/50"
                                    />
                                    <Button
                                        onClick={handleCreateCompany}
                                        disabled={isLoading || !companyName.trim()}
                                        className="font-bold shrink-0"
                                    >
                                        Create
                                    </Button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or Join Existing</span>
                                </div>
                            </div>

                            {/* Join Existing Section */}
                            <div className="space-y-2">
                                <Label htmlFor="join-id" className="text-sm font-semibold">Workspace ID</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="join-id"
                                        placeholder="Paste UUID here..."
                                        value={joinId}
                                        onChange={(e) => setJoinId(e.target.value)}
                                        disabled={isLoading}
                                        className="h-10 bg-background/50 font-mono text-xs"
                                    />
                                    <Button
                                        variant="secondary"
                                        onClick={handleJoinCompany}
                                        disabled={isLoading || !joinId.trim()}
                                        className="font-bold shrink-0"
                                    >
                                        Join
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Join Demo Card */}
                    <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl flex flex-col hover:border-blue-500/20 transition-all duration-500">
                        <CardHeader>
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
                                <Building2 className="h-6 w-6 text-blue-500" />
                            </div>
                            <CardTitle className="text-2xl">Explore Demo</CardTitle>
                            <CardDescription>Instantly join the shared demo workspace to test features.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="flex -space-x-3 justify-center mb-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                                            U{i}
                                        </div>
                                    ))}
                                    <div className="h-10 w-10 rounded-full border-2 border-background bg-primary flex items-center justify-center text-xs font-bold text-white">
                                        +5
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground italic">Join 8 others in the live project site.</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="outline"
                                className="w-full h-12 text-md font-bold hover:bg-blue-500/5 hover:text-blue-500 border-border/50 active:scale-[0.98] transition-all"
                                onClick={joinDemo}
                                disabled={isLoading}
                            >
                                Jump to Demo
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <p className="text-center text-xs text-muted-foreground opacity-50 flex items-center justify-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    Always free for personal projects. Upgrade for enterprise RLS.
                </p>
            </div>
        </div>
    )
}
