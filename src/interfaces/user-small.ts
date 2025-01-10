export interface UserSmall {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    role_id: number;
}

export interface GroupedUser {
    id: number;
    group: string;
    data: UserSmall[];
}