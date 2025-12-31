import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getStatusColor = (status: string, variant: 'badge' | 'text' | 'bg' = 'badge') => {
    const map: Record<string, any> = {
        pending: {
            badge: 'text-amber-600 bg-amber-500/10 border-amber-200',
            text: 'text-amber-600',
            bg: 'bg-amber-500/5',
            border: 'border-amber-200/50'
        },
        approved: {
            badge: 'text-emerald-600 bg-emerald-500/10 border-emerald-200',
            text: 'text-emerald-600',
            bg: 'bg-emerald-500/5',
            border: 'border-emerald-200/50'
        },
        rejected: {
            badge: 'text-red-900 bg-red-500/10 border-red-200',
            text: 'text-red-900',
            bg: 'bg-red-500/5',
            border: 'border-red-200/50'
        },
        fulfilled: {
            badge: 'text-blue-600 bg-blue-500/10 border-blue-200',
            text: 'text-blue-600',
            bg: 'bg-blue-500/5',
            border: 'border-blue-200/50'
        }
    }
    const styles = map[status] || map.pending
    return variant === 'bg' ? `${styles.bg} ${styles.text} ${styles.border}` : styles[variant]
}
