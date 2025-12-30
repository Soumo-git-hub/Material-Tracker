import { Skeleton } from "@/components/ui/skeleton"

export function PageSkeleton() {
    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-[250px]" />
                    <Skeleton className="h-4 w-[350px]" />
                </div>
                <Skeleton className="h-10 w-[120px]" />
            </div>

            <div className="border rounded-md p-4">
                <div className="space-y-4">
                    <div className="flex space-x-4 border-b pb-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex space-x-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
