export type TicketStatus = 'open' | 'snoozed' | 'resolved' | 're-escalated';
export type TicketPriority = 'low' | 'medium' | 'high';
export type CustomerTier = 'Free' | 'Standard' | 'Pro' | 'Enterprise';
export type MessageAuthorType = 'customer' | 'ai' | 'agent' | 'system';
export type SortKey = 'priority' | 'wait_time' | 'recent';

export interface Customer {
  id: string;
  name: string;
  email: string;
  tier: CustomerTier;
  lifetimeValueUsd?: number;
}

/**
 * Lightweight shape — what the queue (left pane) needs to render a row.
 */
export interface TicketSummary {
  id: string;
  customerName: string;
  status: TicketStatus;
  priority: TicketPriority;
  escalationReason: string; // e.g. "Low CSAT (2/5)", "Customer requested human"
  lastMessagePreview: string;
  lastMessageAt: string; // ISO timestamp
  waitTimeMinutes: number;
}

/**
 * Heavy shape — everything the detail pane needs. Fetched once, when a
 * ticket is opened, not as part of the list.
 */
export interface TicketDetail extends TicketSummary {
  customer: Customer;
  aiSummary: string;
  suggestedReply?: string;
  tags: string[];
  csatScore?: number;
}

export interface Message {
  id: string;
  ticketId: string;
  type: MessageAuthorType;
  content: string;
  createdAt: string; // ISO timestamp
}

// ---- Request / response payloads ----

export interface GetTicketsParams {
  status?: TicketStatus;
  sort?: SortKey;
}

export interface PostMessageBody {
  content: string;
}

export interface PatchStatusBody {
  status: TicketStatus;
}

export interface ApiErrorBody {
  error: string;
  message: string;
}
