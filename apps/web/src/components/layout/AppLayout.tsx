import { Outlet, Link, NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { ModeToggle } from "@/components/common/ModeToggle"
import { LogOut, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkspaceSwitcher } from "./WorkspaceSwitcher"

export function AppLayout() {
    const { user, profile, signOut } = useAuth()
    const location = useLocation()
    const isSetup = location.pathname === "/setup-company"

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
                <div className="container flex h-16 items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                            <div className="bg-primary flex items-center justify-center rounded-lg p-1.5">
                                <LayoutGrid className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg tracking-tight hidden md:block">
                                Material<span className="text-primary">Tracker</span>
                            </span>
                        </Link>

                        {user && <WorkspaceSwitcher />}

                        {user && profile?.company_id && !isSetup && (
                            <nav className="hidden lg:flex items-center gap-1 ml-4 py-1 px-1.5 bg-muted/40 rounded-lg border border-border/50">
                                <NavTab to="/material-requests" label="Requests" />
                                <NavTab to="/dashboard" label="Dashboard" />
                                <NavTab to="/settings" label="Settings" />
                            </nav>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        {user && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => signOut()}
                                className="h-9 px-3 text-muted-foreground hover:text-destructive group"
                            >
                                <LogOut className="h-4 w-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
                                <span className="hidden md:inline font-medium">Sign Out</span>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="container py-8 max-w-7xl mx-auto">
                <Outlet />
            </main>
        </div>
    )
}

const NavTab = ({ to, label }: { to: string, label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
            px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
            ${isActive
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/5"}
        `}
    >
        {label}
    </NavLink>
)
