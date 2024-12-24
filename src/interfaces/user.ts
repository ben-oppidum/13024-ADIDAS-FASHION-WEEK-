export interface User {
    id: number;
    created_at: string;  
    updated_at: string; 
    reference: string;
    first_name: string;
    last_name: string;
    email: string;
    role_id: number;
    phone?: string | null; 
    position: string;
    market_id: number;
    qrcode: string;
    badge_received: number;
    badge_received_at?: string | null; 
}



