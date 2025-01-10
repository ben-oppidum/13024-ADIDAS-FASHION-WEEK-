import type { ExternalAccount } from "./external-account";
import type { Area } from "./area";

export interface Meeting {
    id: number;
    created_at: string;
    updated_at: string | null;
    meeting_id: string;
    title: string;
    area_id: number;
    start_date: string;
    end_date: string;
    internal_comment: string;
    client_comment: string;
    external_account_id: number;
    status: number;
    area: Area;
    guests: Guest[];
    external_account: ExternalAccount;
    organizer: Organizer;
    market: Market;
}

export interface MeetingCalendar {
    id: number;
    meetingId: string;
    start: string;
    end: string;
    title: string;
    class: string;
    disabled: boolean;
    draggable: boolean;
    content: MeetingContent;
}

export interface MeetingContent {
    hour: string;
    guests: number;
    title: string;
    info: string;
    areaId: number;
    exAccount: number;
}
  
export interface Guest {
    id: number;
    created_at: string;
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    position: string;
    role_id: number;
}

export interface Market {
    id: number;
    label: string;
}
  
export interface Organizer {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
}