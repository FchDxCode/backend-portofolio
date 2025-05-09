export interface Visitor {
    id: string;
    session_id: string;
    user_agent?: string;
    browser?: string;
    os?: string;
    device_type?: string;
    is_bot?: boolean;
    ip_address?: string;
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    page_url: string;
    referer?: string;
    visited_at?: string;
    duration_seconds?: number;
    created_at?: string;
    updated_at?: string;
}
  
export interface VisitorEvent {
    id: string;
    visitor_id: string;
    event_type?: string;
    event_data?: Record<string, any>;
    event_time?: string;
}