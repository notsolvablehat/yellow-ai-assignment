import type { TicketDetail, Message } from '../../types/ticket';

/**
 * Seed tickets. Deliberately covers the range of cases a real triage
 * queue sees: urgent + resolvable, unresolvable (policy), low priority,
 * re-escalated, and "AI resolved it correctly but the customer got
 * confused" — so the UI has to earn its keep across all of them, not
 * just the happy path.
 *
 * TKT-3381 is wired up in db.ts to fail its FIRST resolve attempt and
 * succeed on retry — that's the "write path that can fail on demand"
 * constraint, made deterministic and demo-able.
 */
export const seedTickets: TicketDetail[] = [
  {
    id: 'TKT-4920',
    customerName: 'Raj Rastewala',
    status: 'open',
    priority: 'high',
    escalationReason: 'Low CSAT (2/5)',
    lastMessagePreview:
      'Yes, absolutely. Please refund it and make sure I never get charged again.',
    lastMessageAt: '2026-07-23T10:45:00Z',
    waitTimeMinutes: 18,
    customer: {
      id: 'C-4921',
      name: 'Raj Rastewala',
      email: 'raj.r@rastewale.com',
      tier: 'Enterprise',
      lifetimeValueUsd: 48000,
    },
    aiSummary:
      "Customer has tried cancelling 3 times and was billed again after each attempt. AI offered to reverse the charge and close the account; customer accepted but wants human confirmation.",
    suggestedReply:
      "Hi Raj, I've confirmed the refund has been processed and your account is fully closed — you won't be billed again. Sorry for the back-and-forth on this one.",
    tags: ['Billing', 'Cancellation'],
    csatScore: 2,
  },
  {
    id: 'TKT-3381',
    customerName: 'Charan Chai',
    status: 'open',
    priority: 'medium',
    escalationReason: 'Customer requested human',
    lastMessagePreview:
      "Agent please. The bot isn't understanding my question about API rate limits on the enterprise tier.",
    lastMessageAt: '2026-07-23T09:10:00Z',
    waitTimeMinutes: 120,
    customer: {
      id: 'C-3381',
      name: 'Charan Chai',
      email: 'charan@chaicorp.io',
      tier: 'Pro',
    },
    aiSummary:
      'Customer is asking about API rate limits on the Enterprise tier. AI could not find a definitive answer and the customer explicitly asked for a human.',
    tags: ['API', 'Rate Limits'],
  },
  {
    id: 'TKT-2210',
    customerName: 'Pavan Kumar',
    status: 're-escalated',
    priority: 'high',
    escalationReason: 'Re-escalated',
    lastMessagePreview:
      'This issue is NOT resolved. The workaround only works on desktop, mobile still crashes.',
    lastMessageAt: '2026-07-23T11:20:00Z',
    waitTimeMinutes: 42,
    customer: {
      id: 'C-2210',
      name: 'Pavan Kumar',
      email: 'pavan.k@yellow.ai',
      tier: 'Enterprise',
    },
    aiSummary:
      'Customer previously closed this ticket after a suggested workaround, but has reopened it — the desktop-only workaround does not fix the reported mobile app crash on launch.',
    tags: ['Mobile', 'Bug', 'Reopened'],
    csatScore: 3,
  },
  {
    id: 'TKT-1187',
    customerName: 'David Chen',
    status: 'open',
    priority: 'low',
    escalationReason: 'General inquiry',
    lastMessagePreview: 'Can you tell me more about the premium features?',
    lastMessageAt: '2026-07-23T07:30:00Z',
    waitTimeMinutes: 240,
    customer: {
      id: 'C-1187',
      name: 'David Chen',
      email: 'd.chen@example.com',
      tier: 'Free',
    },
    aiSummary:
      'Pre-sales question about premium tier features. No urgency — AI routed to a human for a personal touch.',
    tags: ['Sales', 'General Inquiry'],
  },
  {
    id: 'TKT-0099',
    customerName: 'TechCorp Inc.',
    status: 'open',
    priority: 'medium',
    escalationReason: 'Refund request',
    lastMessagePreview:
      "I want a credit applied to my next bill for yesterday's downtime.",
    lastMessageAt: '2026-07-23T09:17:00Z',
    waitTimeMinutes: 65,
    customer: {
      id: 'C-0099',
      name: 'TechCorp Inc.',
      email: 'ops@techcorp.com',
      tier: 'Standard',
    },
    aiSummary:
      "Customer wants a billing credit for yesterday's 45-minute regional outage. Standard tier has no uptime SLA, so AI could not issue a credit; customer became upset and demanded a manager.",
    tags: ['Billing', 'SLA', 'Policy'],
  },
  {
    id: 'TKT-0512',
    customerName: 'Homelander',
    status: 'open',
    priority: 'low',
    escalationReason: 'Confusion after AI resolution',
    lastMessagePreview:
      'WAIT! I just got an email saying my account access is being revoked. I paid for July!',
    lastMessageAt: '2026-07-23T16:12:00Z',
    waitTimeMinutes: 8,
    customer: {
      id: 'C-0512',
      name: 'Homelander',
      email: 'homelander@vought.international',
      tier: 'Standard',
    },
    aiSummary:
      'AI correctly cancelled auto-renewal as requested, but the automated confirmation email\'s wording ("access is being revoked") alarmed the customer, who now believes they\'ve lost access they already paid for.',
    suggestedReply:
      "Don't worry — you still have full access! Your auto-renewal is off so you won't be billed again, but your account stays active through the end of your current billing cycle.",
    tags: ['Cancellation', 'Confusion'],
  },
];

export const seedMessages: Message[] = [
  // TKT-4920
  {
    id: 'msg-4920-1',
    ticketId: 'TKT-4920',
    type: 'customer',
    content:
      "I am extremely frustrated. I've tried to cancel my subscription three times now and every time I get an automated response saying it's done, but I just got billed again.",
    createdAt: '2026-07-23T10:42:00Z',
  },
  {
    id: 'msg-4920-2',
    ticketId: 'TKT-4920',
    type: 'ai',
    content:
      "I apologize for the frustration, Raj. I'm looking into your billing history now. It appears there was a pending charge that hadn't cleared before the previous cancellation attempts were processed. I can immediately reverse this recent charge and fully close the account. Shall I proceed?",
    createdAt: '2026-07-23T10:43:00Z',
  },
  {
    id: 'msg-4920-3',
    ticketId: 'TKT-4920',
    type: 'customer',
    content:
      'Yes, absolutely. Please refund it and make sure I never get charged again. I want to speak to a human to confirm this is actually done.',
    createdAt: '2026-07-23T10:45:00Z',
  },
  {
    id: 'msg-4920-4',
    ticketId: 'TKT-4920',
    type: 'system',
    content: 'Escalated to human agent',
    createdAt: '2026-07-23T10:45:30Z',
  },

  // TKT-3381
  {
    id: 'msg-3381-1',
    ticketId: 'TKT-3381',
    type: 'customer',
    content:
      "Agent please. The bot isn't understanding my question about the API rate limits on the enterprise tier.",
    createdAt: '2026-07-23T09:10:00Z',
  },
  {
    id: 'msg-3381-2',
    ticketId: 'TKT-3381',
    type: 'system',
    content: 'Escalated to human agent — customer requested human',
    createdAt: '2026-07-23T09:10:15Z',
  },

  // TKT-2210
  {
    id: 'msg-2210-1',
    ticketId: 'TKT-2210',
    type: 'customer',
    content:
      'This issue is NOT resolved. The workaround you provided only works on desktop, the mobile app is still crashing on launch.',
    createdAt: '2026-07-23T11:20:00Z',
  },
  {
    id: 'msg-2210-2',
    ticketId: 'TKT-2210',
    type: 'system',
    content: 'Ticket re-opened by customer — routed back to queue',
    createdAt: '2026-07-23T11:20:10Z',
  },

  // TKT-1187
  {
    id: 'msg-1187-1',
    ticketId: 'TKT-1187',
    type: 'customer',
    content: 'Can you tell me more about the premium features?',
    createdAt: '2026-07-23T07:30:00Z',
  },
  {
    id: 'msg-1187-2',
    ticketId: 'TKT-1187',
    type: 'ai',
    content:
      "Here's an overview of our premium tier: [docs link]. Would you like me to connect you with someone from our team for a personalized walkthrough?",
    createdAt: '2026-07-23T07:30:30Z',
  },

  // TKT-0099
  {
    id: 'msg-0099-1',
    ticketId: 'TKT-0099',
    type: 'customer',
    content:
      "Your US-East servers went down for almost an hour yesterday. I want a credit applied to my next month's bill for the downtime.",
    createdAt: '2026-07-23T09:15:00Z',
  },
  {
    id: 'msg-0099-2',
    ticketId: 'TKT-0099',
    type: 'ai',
    content:
      'I apologize for the disruption yesterday. However, looking at your account, you are currently on the Standard Plan. Uptime SLA credits are only available for our Enterprise customers.',
    createdAt: '2026-07-23T09:15:30Z',
  },
  {
    id: 'msg-0099-3',
    ticketId: 'TKT-0099',
    type: 'customer',
    content: 'That is completely unacceptable. Get me a human manager right now.',
    createdAt: '2026-07-23T09:17:00Z',
  },

  // TKT-0512
  {
    id: 'msg-0512-1',
    ticketId: 'TKT-0512',
    type: 'customer',
    content: "Cancel my subscription. I don't want to renew next month.",
    createdAt: '2026-07-23T16:10:00Z',
  },
  {
    id: 'msg-0512-2',
    ticketId: 'TKT-0512',
    type: 'ai',
    content: 'I have successfully cancelled your subscription. Your auto-renewal has been turned off.',
    createdAt: '2026-07-23T16:10:20Z',
  },
  {
    id: 'msg-0512-3',
    ticketId: 'TKT-0512',
    type: 'customer',
    content:
      'WAIT! I just got an email saying "Your account access is being revoked." I paid for the whole month of July! I need a human immediately.',
    createdAt: '2026-07-23T16:12:00Z',
  },
];
