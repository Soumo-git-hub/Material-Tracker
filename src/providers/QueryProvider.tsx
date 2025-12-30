import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"

export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutes stale time
                gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection
                refetchOnWindowFocus: false, // Performance: don't refetch on window focus
                retry: 1, // Only retry once to avoid persistent loading loops
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
