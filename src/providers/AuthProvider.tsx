import { useEffect, useState, useMemo, type ReactNode, useCallback } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { AuthContext } from "@/hooks/useAuth"
import type { UserProfile } from "@/types"

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data: userProfile, error } = await supabase
                .from("profiles")
                .select("*, companies(name)")
                .eq("id", userId)
                .single()

            if (error) {
                console.error(`Failed to fetch profile for user ${userId}:`, error.message)
                // Don't clear profile on error if we have cached data, just warn
            } else if (userProfile) {
                const typedProfile = userProfile as UserProfile
                setProfile(typedProfile)
                // Cache profile for instant load next time
                try {
                    localStorage.setItem(`profile_${userId}`, JSON.stringify(typedProfile))
                } catch (e) {
                    console.warn("Failed to cache profile", e)
                }
            }
        } catch (err) {
            console.error("Unexpected error fetching profile:", err)
        }
    }

    const refreshProfile = useCallback(async () => {
        if (user) await fetchUserProfile(user.id)
    }, [user])

    useEffect(() => {
        let mounted = true

        const initializeAuth = async () => {
            try {
                // 1. Get Session
                const { data: { session: existingSession }, error } = await supabase.auth.getSession()
                if (error) throw error

                if (!mounted) return

                setSession(existingSession)
                const currentUser = existingSession?.user ?? null
                setUser(currentUser)

                if (currentUser) {
                    // 2. Try Cache
                    const cached = localStorage.getItem(`profile_${currentUser.id}`)
                    let profileFound = false

                    if (cached) {
                        try {
                            setProfile(JSON.parse(cached))
                            profileFound = true
                        } catch (e) { /* ignore */ }
                    }

                    // 3. If cached, we can release loading immediately and fetch in BG
                    // If NOT cached, we MUST await fetch to prevent premature redirect
                    const fetchPromise = fetchUserProfile(currentUser.id)

                    if (profileFound) {
                        setLoading(false)
                        await fetchPromise // Update in background (mostly silent)
                    } else {
                        await fetchPromise // Block until loaded so we don't redirect to setup-company
                    }
                }
            } catch (err) {
                console.error("Auth initialization failed:", err instanceof Error ? err.message : err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        // Failsafe: Force loading false after 3s to prevent infinite loop
        const failsafe = setTimeout(() => {
            if (mounted) {
                console.warn("Auth: Failsafe forced loading release")
                setLoading(false)
            }
        }, 3000)

        initializeAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (!mounted) return

            // Allow immediate session update
            setSession(newSession)
            setUser(newSession?.user ?? null)

            if (!newSession?.user) {
                setProfile(null)
                setLoading(false)
            }
            // If user exists, we let the effects/swr handle it, or we could fetch here
        })

        return () => {
            mounted = false
            clearTimeout(failsafe)
            subscription.unsubscribe()
        }
    }, [])

    const signOut = async () => {
        // Clear local storage cache on signout
        if (user) localStorage.removeItem(`profile_${user.id}`)

        setProfile(null)
        setSession(null)
        setUser(null)
        setLoading(true)

        await supabase.auth.signOut()
        window.location.href = "/login"
    }

    const value = useMemo(() => ({
        session,
        user,
        profile,
        loading,
        signOut,
        refreshProfile
    }), [session, user, profile, loading, refreshProfile])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
