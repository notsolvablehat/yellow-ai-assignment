import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import type { TicketStatus, SortKey, PatchStatusBody, ApiErrorBody } from '../../types/ticket';

const randomDelay = () => delay(200 + Math.floor(Math.random() * 300));

export const ticketHandlers = [
  // GET /api/tickets?status=open&sort=priority
  http.get('/api/tickets', async ({ request }) => {
    await randomDelay();
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

    try {
      const updated = db.updateStatus(params.id as string, body.status);
      return HttpResponse.json(updated);
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_FOUND') {
        return HttpResponse.json<ApiErrorBody>(
          { error: 'NOT_FOUND', message: `No ticket with id ${params.id}` },
          { status: 404 }
        );
      }

      // Resolve TKT-3381 to trigger this once; it succeeds on the retry.
      return HttpResponse.json<ApiErrorBody>(
        {
          error: 'RESOLVE_FAILED',
          message: 'Something went wrong updating this ticket. Please try again.',
        },
        { status: 500 }
      );
    }
  }),
];
