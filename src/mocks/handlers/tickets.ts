import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { debugStore } from '../../lib/debugStore';
import type { TicketStatus, SortKey, PatchStatusBody, ApiErrorBody } from '../../types/ticket';

const randomDelay = () => delay(200 + Math.floor(Math.random() * 300));

const SIMULATED_FAILURE_RESPONSE = HttpResponse.json<ApiErrorBody>(
  {
    error: 'RESOLVE_FAILED',
    message: 'Something went wrong updating this ticket. Please try again.',
  },
  { status: 500 }
);

export const ticketHandlers = [
  // GET /api/tickets?status=open&sort=priority
  http.get('/api/tickets', async ({ request }) => {
    await randomDelay();

    // Debug: simulate fetch failure
    if (debugStore.fetchFailure) {
      return HttpResponse.json<ApiErrorBody>(
        { error: 'FETCH_FAILED', message: 'Simulated fetch failure (debug mode).' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const status = (url.searchParams.get('status') as TicketStatus | null) ?? undefined;
    const sort = (url.searchParams.get('sort') as SortKey | null) ?? undefined;
    return HttpResponse.json(db.listTickets({ status, sort }));
  }),

  // GET /api/tickets/:id
  http.get('/api/tickets/:id', async ({ params }) => {
    await randomDelay();
    const ticket = db.getTicket(params.id as string);
    if (!ticket) {
      return HttpResponse.json<ApiErrorBody>(
        { error: 'NOT_FOUND', message: `No ticket with id ${params.id}` },
        { status: 404 }
      );
    }
    return HttpResponse.json(ticket);
  }),

  // PATCH /api/tickets/:id/status  — resolve / snooze / reopen
  http.patch('/api/tickets/:id/status', async ({ params, request }) => {
    await randomDelay();
    const body = (await request.json()) as PatchStatusBody;
    const id = params.id as string;

    // Debug: global resolve failure overrides everything
    if (body.status === 'resolved' && debugStore.resolveFailure) {
      return SIMULATED_FAILURE_RESPONSE;
    }

    // Debug: per-ticket mode overrides
    if (body.status === 'resolved') {
      const mode = debugStore.perTicketMode[id] ?? 'normal';
      if (mode === 'always-error') {
        return SIMULATED_FAILURE_RESPONSE;
      }
      if (mode === 'flaky') {
        if (!debugStore.flakyHasFailed.has(id)) {
          debugStore.flakyHasFailed.add(id);
          return SIMULATED_FAILURE_RESPONSE;
        }
        // Second attempt: fall through to normal resolve
      }
    }

    try {
      const updated = db.updateStatus(id, body.status);
      return HttpResponse.json(updated);
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_FOUND') {
        return HttpResponse.json<ApiErrorBody>(
          { error: 'NOT_FOUND', message: `No ticket with id ${id}` },
          { status: 404 }
        );
      }
      // db-level SIMULATED_FAILURE (original TKT-3381 flaky logic still works)
      return SIMULATED_FAILURE_RESPONSE;
    }
  }),
];
