import { seedTickets, seedMessages } from './data/seed';
import type {
  TicketSummary,
  TicketDetail,
  Message,
  TicketStatus,
  SortKey,
  MessageAuthorType,
} from '../types/ticket';

let tickets: TicketDetail[] = structuredClone(seedTickets);
let messages: Message[] = structuredClone(seedMessages);

const FLAKY_ON_FIRST_RESOLVE = new Set(['TKT-3381']);
const hasFailedOnce = new Set<string>();

const priorityRank: Record<TicketDetail['priority'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function toSummary(t: TicketDetail): TicketSummary {
  const { customer: _customer, aiSummary: _aiSummary, suggestedReply: _suggestedReply, tags: _tags, csatScore: _csatScore, ...summary } = t;
  return summary;
}

export const db = {
  listTickets(params: { status?: TicketStatus; sort?: SortKey } = {}): TicketSummary[] {
    let result = tickets.filter((t) =>
      params.status ? t.status === params.status : t.status !== 'resolved'
    );

    switch (params.sort) {
      case 'priority':
        result = [...result].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
        break;
      case 'wait_time':
        result = [...result].sort((a, b) => b.waitTimeMinutes - a.waitTimeMinutes);
        break;
      case 'recent':
        result = [...result].sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        break;
    }
    return result.map(toSummary);
  },

  getTicket(id: string): TicketDetail | undefined {
    return tickets.find((t) => t.id === id);
  },

  getMessages(ticketId: string): Message[] {
    return messages
      .filter((m) => m.ticketId === ticketId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  addMessage(ticketId: string, content: string, type: MessageAuthorType = 'agent'): Message {
    const existingMessages = this.getMessages(ticketId);
    const lastMsg = existingMessages[existingMessages.length - 1];

    let createdAt = new Date().toISOString();
    if (lastMsg) {
      const lastTime = new Date(lastMsg.createdAt).getTime();
      const nowTime = new Date(createdAt).getTime();
      if (nowTime <= lastTime) {
        createdAt = new Date(lastTime + 1000).toISOString();
      }
    }

    const message: Message = {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      ticketId,
      type,
      content,
      createdAt,
    };
    messages.push(message);

    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.lastMessagePreview = content;
      ticket.lastMessageAt = message.createdAt;
    }
    return message;
  },

  /**
   * Returns the updated ticket, or throws:
   *  - Error('NOT_FOUND')            → handler should return 404
   *  - Error('SIMULATED_FAILURE')    → handler should return 500
   */
  updateStatus(id: string, status: TicketStatus): TicketSummary {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) {
      throw new Error('NOT_FOUND');
    }

    if (status === 'resolved' && FLAKY_ON_FIRST_RESOLVE.has(id) && !hasFailedOnce.has(id)) {
      hasFailedOnce.add(id);
      throw new Error('SIMULATED_FAILURE');
    }

    ticket.status = status;
    return toSummary(ticket);
  },

  search(query: string): TicketSummary[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tickets
      .filter(
        (t) =>
          t.customerName.toLowerCase().includes(q) ||
          t.lastMessagePreview.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
      .map(toSummary);
  },

  reset(): void {
    tickets = structuredClone(seedTickets);
    messages = structuredClone(seedMessages);
    hasFailedOnce.clear();
  },
};
