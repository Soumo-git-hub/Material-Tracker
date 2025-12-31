import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Layout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/form-controls"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const schema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Min 6 characters"),
})

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [tab, setTab] = useState("login")
    const { toast } = useToast()
    const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } })

    const onSubmit = async (data: z.infer<typeof schema>) => {
        setLoading(true)
        const { error } = tab === "login"
            ? await supabase.auth.signInWithPassword(data)
            : await supabase.auth.signUp(data)

        if (error) toast({ variant: "destructive", title: "Auth Error", description: error.message })
        else if (tab === "signup") {
            toast({ title: "Success", description: "Account created. Please sign in." })
            setTab("login")
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
            <div className="w-full max-w-[380px] space-y-6">
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-2.5 bg-primary rounded-xl shadow-lg shadow-primary/20">
                        <Layout className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold tracking-tight">Material Tracker</h1>
                        <p className="text-xs text-muted-foreground">Internal Inventory Management</p>
                    </div>
                </div>

                <Card className="border-border/50 shadow-xl overflow-hidden">
                    <Tabs value={tab} onValueChange={setTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 rounded-none h-12 bg-muted/30">
                            <TabsTrigger value="login" className="text-xs font-semibold">Sign In</TabsTrigger>
                            <TabsTrigger value="signup" className="text-xs font-semibold">Sign Up</TabsTrigger>
                        </TabsList>
                        <CardContent className="pt-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Email</FormLabel>
                                            <FormControl><Input placeholder="name@company.com" className="h-10 text-sm" {...field} /></FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Password</FormLabel>
                                            <FormControl><Input type="password" placeholder="••••••••" className="h-10 text-sm" {...field} /></FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )} />
                                    <Button type="submit" className="w-full h-10 text-xs font-bold" disabled={loading}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (tab === "login" ? "CONTINUE" : "REGISTER")}
                                    </Button>
                                    <div className="relative pt-2">
                                        <div className="absolute inset-x-0 top-1/2 flex items-center"><span className="w-full border-t border-border/60" /></div>
                                        <div className="relative flex justify-center text-[10px] font-bold uppercase text-muted-foreground"><span className="bg-card px-2">Secure Gateway</span></div>
                                    </div>
                                    <Button variant="outline" type="button" className="w-full h-10 text-xs font-bold" disabled={loading} onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>
                                        <svg className="h-3.5 w-3.5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                        Google Access
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Tabs>
                </Card>
                <footer className="text-center text-[10px] text-muted-foreground opacity-50 uppercase tracking-widest font-bold">
                    © {new Date().getFullYear()} Material Tracker System
                </footer>
            </div>
        </div>
    )
}
