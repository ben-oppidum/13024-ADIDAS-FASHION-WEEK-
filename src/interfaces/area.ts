export type TimeString = `${number extends infer H extends 0 | 1 | 2 ? '0' | '1' | '2' : number}:${number extends infer M extends 0 | 1 | 2 ? '0' | '1' | '2' : number}:${number}`;

export interface Area {
    id: number;
    label: string;
    type: string;
    max_meeting: number;
    max_duration: number;
    max_attendees: number;
    meeting_confirmation: boolean;
    address: string;
    city: string;
    google_maps: string;
    sellout_days: SelloutDay[];
}

interface SelloutDay {
    id: number;
    day: string;
    start_time: TimeString; 
    end_time: TimeString; 
}

