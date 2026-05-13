import type { EventEntityType, EventType, ActorType } from './enums';

export interface EventLog {
  log_id: string;
  entity_type: EventEntityType;
  entity_id: string;
  event_type: EventType;
  old_value?: string;                   // JSON string for complex changes
  new_value?: string;
  actor_id?: string;
  actor_type: ActorType;
  timestamp: string;
  narrative: string;                    // "[User] changed status from X → Y on [Date]" — pre-formatted by backend
  ip_address?: string;
  session_id?: string;
}
