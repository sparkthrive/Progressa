export type GroupType = 'friends' | 'gym' | 'company' | 'bootcamp' | 'online';
export type GroupRole = 'admin' | 'coadmin' | 'trainer' | 'member';
export type ActivityType = 'workout_completed' | 'new_pr' | 'photo_uploaded' | 'challenge_won' | 'joined_group';

export interface Group {
    id: string;
    name: string;
    description: string | null;
    photo_url: string | null;
    type: GroupType;
    is_private: boolean;
    max_members: number | null;
    current_members: number;
    join_code: string | null;
    qr_code: string | null;
    recurring_schedule: any;
    settings: any;
    creator_id: string;
    created_at: string;
}

export interface GroupMember {
    id: string;
    group_id: string;
    user_id: string;
    role: GroupRole;
    joined_at: string;
    status: 'active' | 'inactive';
    user?: {
        full_name?: string;
        avatar_url?: string;
    };
}

export interface GroupActivity {
    id: string;
    group_id: string;
    user_id: string | null;
    type: ActivityType;
    data: any;
    is_public: boolean;
    approved: boolean;
    created_at: string;
    user?: {
        full_name?: string;
        avatar_url?: string;
    };
}

export interface GroupMessage {
    id: string;
    group_id: string;
    user_id: string | null;
    content: string;
    type: 'text' | 'image' | 'system';
    attachments: string[] | null;
    pinned_by: string | null;
    deleted: boolean;
    created_at: string;
    user?: {
        full_name?: string;
        avatar_url?: string;
    };
}

export interface GroupClass {
    id: string;
    group_id: string;
    trainer_id: string | null;
    name: string;
    description: string | null;
    start_time: string;
    duration_minutes: number;
    max_attendees: number | null;
    current_attendees: number;
    recurring_type: string | null;
    price: number;
    created_at: string;
    trainer?: {
        full_name?: string;
        avatar_url?: string;
    };
}

export interface GroupEvent {
    id: string;
    group_id: string;
    name: string;
    type: string | null;
    date_time: string;
    location: string | null;
    description: string | null;
    max_attendees: number | null;
    rsvp_count: number;
    created_by: string | null;
}
