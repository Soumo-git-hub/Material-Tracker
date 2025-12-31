import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { MaterialRequest, MaterialRequestWithUser, RequestStatus } from "@/types"

export function useMaterialRequests() {
    const qc = useQueryClient()
    const { user, profile } = useAuth()
    const key = ['material-requests', profile?.company_id]

    const { data: requests, isLoading } = useQuery({
        queryKey: key,
        queryFn: async (): Promise<MaterialRequestWithUser[]> => {
            if (!profile?.company_id) return []

            const { data, error } = await supabase
                .from('material_requests')
                .select(`
                    *,
                    profiles:requested_by (
                        full_name
                    )
                `)
                .eq('company_id', profile.company_id)
                .order('requested_at', { ascending: false })

            if (error) throw error

            return (data as any[]).map(r => ({
                ...r,
                requested_by_name: r.profiles?.full_name || 'Unknown Personnel'
            }))
        },
        enabled: !!profile?.company_id,
        staleTime: 60000,
    })

    const createRequest = useMutation({
        mutationFn: async (newRequest: Omit<MaterialRequest, 'id' | 'requested_at' | 'updated_at' | 'company_id' | 'requested_by' | 'status'>) => {
            if (!user?.id || !profile?.company_id) throw new Error("User not authenticated")

            const { error } = await supabase.from('material_requests').insert([{
                ...newRequest,
                status: 'pending',
                company_id: profile.company_id,
                requested_by: user.id
            }])
            if (error) throw error
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    })

    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: RequestStatus }) => {
            const { error } = await supabase
                .from('material_requests')
                .update({ status })
                .eq('id', id)
            if (error) throw error
        },
        onMutate: async ({ id, status }) => {
            await qc.cancelQueries({ queryKey: key })
            const previousRequests = qc.getQueryData<MaterialRequestWithUser[]>(key)

            qc.setQueryData<MaterialRequestWithUser[]>(key, (old) =>
                old ? old.map(r => r.id === id ? { ...r, status } : r) : []
            )

            return { previousRequests }
        },
        onError: (_err, _newReq, context) => {
            if (context?.previousRequests) {
                qc.setQueryData(key, context.previousRequests)
            }
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    })

    const updateRequest = useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<MaterialRequest> }) => {
            const { error } = await supabase
                .from('material_requests')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    })

    return {
        requests,
        isLoading,
        createRequest: createRequest.mutateAsync,
        updateRequest: updateRequest.mutateAsync,
        updateStatus: updateStatus.mutateAsync,
        isCreating: createRequest.isPending,
        isUpdating: updateStatus.isPending,
        isEditing: updateRequest.isPending
    }
}
