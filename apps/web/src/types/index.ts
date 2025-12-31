export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled';

export interface Company {
    id: string;
    name: string;
    created_at: string;
}

export interface UserProfile {
    id: string;
    company_id: string | null;
    full_name: string | null;
    role: 'admin' | 'foreman' | 'worker'; // inferred
    avatar_url?: string;
    updated_at?: string;
    companies?: {
        name: string;
    } | null;
}

export interface MaterialRequest {
    id: string;
    company_id: string;
    requested_by: string;
    project_id?: string;
    material_name: string;
    quantity: number;
    unit: string;
    priority: PriorityLevel;
    status: RequestStatus;
    notes?: string;
    image_url?: string;
    requested_at: string;
    updated_at?: string;
    // Joins
    profiles?: {
        full_name: string | null;
    };
}

export interface MaterialRequestWithUser extends MaterialRequest {
    requested_by_name: string;
}
