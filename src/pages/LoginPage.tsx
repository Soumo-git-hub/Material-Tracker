import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Construction, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/form-controls"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const authSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type AuthFormValues = z.infer<typeof authSchema>

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("login")

    const form = useForm<AuthFormValues>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: AuthFormValues) {
        setIsLoading(true)
        try {
            if (activeTab === "login") {
                const { error } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password,
                })
                if (error) {
                    if (error.message.includes("Invalid login credentials") || error.message.includes("no user")) {
                        toast({
                            variant: "destructive",
                            title: "User not found",
                            description: "We couldn't find an account with that email. Please Sign Up.",
                        })
                        setActiveTab("signup")
                        return
                    }
                    throw error
                }
            } else {
                const { error } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                })
                if (error) throw error
                toast({
                    title: "Welcome aboard!",
                    description: "Account created successfully.",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: (error as Error).message,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-[90vh] items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="p-3 rounded-full bg-primary/10">
                            <Construction className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tighter">Material Request Tracker</h1>
                    <p className="text-muted-foreground">The AI-powered material request platform for modern construction sites.</p>
                </div>

                <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <CardHeader>
                            <TabsList className="grid w-full grid-cols-2 h-12">
                                <TabsTrigger value="login" className="text-base">Login</TabsTrigger>
                                <TabsTrigger value="signup" className="text-base">Sign Up</TabsTrigger>
                            </TabsList>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="foreman@example.com" className="pl-9 h-11" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" className="h-11" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full h-11 text-base shadow-lg" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {activeTab === "login" ? "Sign In to Workspace" : "Create Account"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter>
                            <p className="text-xs text-center text-muted-foreground w-full px-8">
                                By clicking continue, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </CardFooter>
                    </Tabs>
                </Card>
            </div>
        </div>
    )
}
