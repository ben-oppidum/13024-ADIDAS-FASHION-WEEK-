import type { UserSmall } from '@/interfaces/user-small'

export interface ExternalAccount {
    id: number;
    label: string;
    market: Market[];
    clients: UserSmall[];
}

interface Market {
    id: number;
    label: string;
}

