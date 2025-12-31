import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/form-controls"
import { Copy, Building2, UserCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
    const { profile, user } = useAuth()
    const { toast } = useToast()

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({ title: "Copied", description: "Company ID copied to clipboard." })
    }

    if (!profile) return null

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <div className="grid gap-6">
                {/* Company Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <CardTitle>Workspace Settings</CardTitle>
                        </div>
                        <CardDescription>Manage your company workspace details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Company Name</Label>
                            <Input value={profile.companies?.name || "Unknown Company"} disabled readOnly />
                        </div>

                        <div className="grid gap-2">
                            <Label>Invite Team Members</Label>
                            <div className="flex flex-col gap-2">
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Share this Workspace ID to let others join your company.
                                </p>
                                <div className="flex gap-2">
                                    <div className="relative w-full">
                                        <div className="absolute inset-0 bg-muted/50 backdrop-blur-[2px] z-10 flex items-center pl-3 rounded-md border border-dashed select-none group hover:hidden transition-all text-xs font-mono text-muted-foreground">
                                            Hidden for security (Hover to reveal)
                                        </div>
                                        <Input
                                            value={profile.company_id || ""}
                                            disabled
                                            readOnly
                                            className="font-mono text-muted-foreground bg-muted/20"
                                        />
                                    </div>
                                    <Button variant="secondary" onClick={() => copyToClipboard(profile.company_id || "")}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy ID
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-primary" />
                            <CardTitle>Your Profile</CardTitle>
                        </div>
                        <CardDescription>Your personal account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input value={user?.email || ""} disabled readOnly />
                        </div>
                        <div className="grid gap-2">
                            <Label>Role</Label>
                            <div className="flex items-center gap-2">
                                <Input value={profile.role || "employee"} disabled readOnly className="capitalize" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
