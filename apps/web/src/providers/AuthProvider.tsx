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
            // Explicitly selecting foreign key to avoid join errors if relation is missing
            const { data, error } = await supabase
                .from("profiles")
                .select("*, companies:company_id(name)")
                .eq("id", userId)
                .single()

            if (!error && data) {
                const typedProfile = data as UserProfile
                setProfile(typedProfile)
                localStorage.setItem(`profile_${userId}`, JSON.stringify(typedProfile))
            }
        } catch (err) {
            console.error("Profile sync failed:", err)
        }
    }

    const refreshProfile = useCallback(async () => {
        if (user) await fetchUserProfile(user.id)
    }, [user])

    useEffect(() => {
        let mounted = true

        const init = async () => {
            try {
                const { data: { session: s } } = await supabase.auth.getSession()
                if (!mounted) return

                setSession(s)
                setUser(s?.user ?? null)

                if (s?.user) {
                    const cached = localStorage.getItem(`profile_${s.user.id}`)
                    if (cached) setProfile(JSON.parse(cached))
                    await fetchUserProfile(s.user.id)
                }
            } finally {
                if (mounted) setLoading(false)
            }
        }

        init()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
            if (!mounted) return
            setSession(s)
            setUser(s?.user ?? null)
            if (!s?.user) {
                setProfile(null)
                setLoading(false)
            } else {
                fetchUserProfile(s.user.id)
            }
        })

        return () => { mounted = false; subscription.unsubscribe() }
    }, [])

    const signOut = async () => {
        if (user) localStorage.removeItem(`profile_${user.id}`)
        setProfile(null); setSession(null); setUser(null); setLoading(true)
        await supabase.auth.signOut()
        window.location.href = "/login"
    }

    const value = useMemo(() => ({ session, user, profile, loading, signOut, refreshProfile }), [session, user, profile, loading, refreshProfile])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
