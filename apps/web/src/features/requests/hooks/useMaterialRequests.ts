import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

export function useMaterialRequests() {
    const qc = useQueryClient()
    const { user, profile } = useAuth()
    const key = ['material-requests', profile?.company_id]

    const { data: requests, isLoading } = useQuery({
        queryKey: key,
        queryFn: async () => {
            if (!profile?.company_id) return []
            const { data, error } = await supabase.from('material_requests')
                .select('*, profiles:requested_by(full_name)')
                .eq('company_id', profile.company_id)
                .order('requested_at', { ascending: false })
            if (error) throw error
            return data.map(r => ({ ...r, requested_by_name: (r.profiles as any)?.full_name || 'Personnel' }))
        },
        enabled: !!profile?.company_id,
        staleTime: 60000,
    })

    const createRequest = useMutation({
        mutationFn: async (v: any) => {
            const { error } = await supabase.from('material_requests').insert([{
                ...v,
                company_id: profile?.company_id,
                requested_by: user?.id
            }])
            if (error) throw error
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    })

    return {
        requests, isLoading,
        createRequest: createRequest.mutateAsync,
        isPending: createRequest.isPending
    }
}
