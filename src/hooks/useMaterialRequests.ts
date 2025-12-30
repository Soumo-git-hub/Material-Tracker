import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { MaterialRequest, MaterialRequestWithUser } from "@/types"

export type NewMaterialRequest = Omit<MaterialRequest, 'id' | 'requested_at' | 'company_id' | 'requested_by' | 'updated_at'>

export function useMaterialRequests() {
    const queryClient = useQueryClient()
    const { user, profile } = useAuth()

    // Subscribe to real-time changes for the company
    // Real-time subscription disabled for performance
    /*
    useEffect(() => {
        if (!user || !profile?.company_id) return

        const channel = supabase
            .channel(`requests-comp-${profile.company_id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'material_requests',
                    filter: `company_id=eq.${profile.company_id}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['material-requests', profile.company_id] })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, profile?.company_id, queryClient])
    */

    const queries = {
        list: useQuery({
            queryKey: ['material-requests', profile?.company_id],
            queryFn: async (): Promise<MaterialRequestWithUser[]> => {
                if (!profile?.company_id) return []

                const { data: rawRequests, error } = await supabase
                    .from('material_requests')
                    .select('*, profiles:requested_by(full_name)')
                    .eq('company_id', profile?.company_id)
                    .order('requested_at', { ascending: false })
                    .limit(50)

                if (error) {
                    console.error("Failed to fetch material requests:", error.message)
                    throw error
                }

                // Supabase returns profiles as an object or array, we strictly type it here to avoid 'any'
                // We know the join structure from the query
                return (rawRequests || []).map((req) => ({
                    ...req,
                    requested_by_name: req.profiles && !Array.isArray(req.profiles)
                        ? (req.profiles as { full_name: string }).full_name || 'Unknown'
                        : 'System User'
                })) as MaterialRequestWithUser[]
            },
            enabled: !!user && !!profile?.company_id,
            staleTime: 30000,
            gcTime: 10 * 60 * 1000,
        }),
    }

    const mutations = {
        create: useMutation({
            mutationFn: async (newRequest: NewMaterialRequest) => {
                if (!profile?.company_id || !user?.id) throw new Error("No active workspace or user")

                const { data: createdRequest, error } = await supabase
                    .from('material_requests')
                    .insert([{
                        ...newRequest,
                        company_id: profile.company_id,
                        requested_by: user.id
                    }])
                    .select()
                    .single()

                if (error) throw error
                return createdRequest
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['material-requests', profile?.company_id] })
            },
        }),
        updateStatus: useMutation({
            mutationFn: async ({ id, status }: { id: string; status: MaterialRequest['status'] }) => {
                const { data: updatedRequest, error } = await supabase
                    .from('material_requests')
                    .update({ status })
                    .eq('id', id)
                    .select()
                    .single()

                if (error) throw error
                return updatedRequest
            },
            onMutate: async ({ id, status }) => {
                await queryClient.cancelQueries({ queryKey: ['material-requests', profile?.company_id] })
                const previousRequests = queryClient.getQueryData<MaterialRequestWithUser[]>(['material-requests', profile?.company_id])

                queryClient.setQueryData(['material-requests', profile?.company_id], (old: MaterialRequestWithUser[] | undefined) => {
                    return old?.map(req => req.id === id ? { ...req, status } : req)
                })

                return { previousRequests }
            },
            onError: (err, _newVal, context) => {
                console.error("Failed to update status for request:", _newVal.id, err)
                queryClient.setQueryData(['material-requests', profile?.company_id], context?.previousRequests)
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['material-requests', profile?.company_id] })
            },
        }),
    }

    return {
        requests: queries.list.data,
        isLoading: queries.list.isLoading,
        error: queries.list.error,
        createRequest: mutations.create.mutateAsync,
        updateStatus: mutations.updateStatus.mutateAsync,
        isCreating: mutations.create.isPending,
        isUpdating: mutations.updateStatus.isPending,
    }
}
