export type RoleNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface User {
    id: number;
    created_at: string;  
    updated_at?: string; 
    reference: string;
    first_name: string;
    last_name: string;
    email: string;
    role_id: RoleNumber;
    role: Role;
    phone?: string | null; 
    position: string;
    market?: Market;
    qrcode: string;
    badge: Badge;
    external_account?: ExternalAccount[];
    meetings: UserMeeting[];
}

interface ExternalAccount {
    id: number;
    label: string;
}

interface Badge {
    received: boolean;
    date: string
}

interface Market {
    id: number;
    label: string
}

interface Role {
    id: RoleNumber;
    role_name: string;
    permissions: string;
}

export interface UserMeeting {
    id: string;
    created_at: string;
    type: number;
    start_date: string;
    end_date: string;
    status: number;
}

export interface Notification {
    state: boolean;
    severity: 'success' | 'error' | 'info' | 'warn' | 'secondary' | 'contrast';
    group: string;
    message: string;
}