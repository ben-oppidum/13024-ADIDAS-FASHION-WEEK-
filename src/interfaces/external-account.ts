import type { UserSmall } from '@/interfaces/user-small'

export interface ExternalAccount {
    id: number;
    label: string;
    market: Market[];
    clients: UserSmall[];
}

export interface ExternalAccountSmall {
    id: number;
    label: string;
    market_label: string;
}

interface Market {
    id: number;
    label: string;
}

export interface ExternalAccountType {
    state: boolean;
    type: 'single' | 'multiselect'
}