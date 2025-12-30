import { Outlet, Link, NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { ModeToggle } from "@/components/common/ModeToggle"
import { LogOut, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkspaceSwitcher } from "./WorkspaceSwitcher"

export function AppLayout() {
    const { user, profile, signOut } = useAuth()
    const location = useLocation()
    const isSetupPage = location.pathname === "/setup-company"

    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center gap-6">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center space-x-2 shrink-0">
                            <div className="bg-primary rounded-lg p-1.5 shadow-lg shadow-primary/20">
                                <LayoutGrid className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg hidden lg:inline-block tracking-tight">Material<span className="text-primary font-black">Tracker</span></span>
                        </Link>

                        {/* Instant Switcher - The new primary navigation */}
                        {user && <WorkspaceSwitcher />}

                        {/* ONLY show nav links if user is fully onboarded AND not on setup page */}
                        {user && !!profile?.company_id && !isSetupPage && (
                            <nav className="flex items-center p-1 space-x-1 text-sm font-medium bg-muted/40 rounded-xl border border-border/40 ml-4">
                                <NavLink
                                    to="/material-requests"
                                    className={({ isActive }) =>
                                        `px-4 py-1.5 rounded-lg transition-all duration-200 ${isActive
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                                            : "text-foreground/60 hover:text-foreground hover:bg-muted/60"}`
                                    }
                                >
                                    Requests
                                </NavLink>
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) =>
                                        `px-4 py-1.5 rounded-lg transition-all duration-200 ${isActive
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                                            : "text-foreground/60 hover:text-foreground hover:bg-muted/60"}`
                                    }
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    to="/settings"
                                    className={({ isActive }) =>
                                        `px-4 py-1.5 rounded-lg transition-all duration-200 ${isActive
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                                            : "text-foreground/60 hover:text-foreground hover:bg-muted/60"}`
                                    }
                                >
                                    Settings
                                </NavLink>
                            </nav>
                        )}
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                        </div>
                        <nav className="flex items-center gap-2">
                            <ModeToggle />
                            {user && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut()}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <LogOut className="sm:mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Sign Out</span>
                                </Button>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
            <main className="container py-6">
                <Outlet />
            </main>
        </div>
    )
}
