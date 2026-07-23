import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import type { PostMessageBody, ApiErrorBody } from '../../types/ticket';

const randomDelay = () => delay(200 + Math.floor(Math.random() * 300)); // 200–500ms

export const messageHandlers = [
  // GET /api/tickets/:id/messages
  http.get('/api/tickets/:id/messages', async ({ params }) => {
    await randomDelay();
    const ticket = db.getTicket(params.id as string);
    if (!ticket) {
      return HttpResponse.json<ApiErrorBody>(
        { error: 'NOT_FOUND', message: `No ticket with id ${params.id}` },
        { status: 404 }
      );
    }
    return HttpResponse.json(db.getMessages(params.id as string));
  }),

  // POST /api/tickets/:id/messages — agent sends a reply
  http.post('/api/tickets/:id/messages', async ({ params, request }) => {
    await randomDelay();
    const body = (await request.json()) as PostMessageBody;

    if (!body.content?.trim()) {
      return HttpResponse.json<ApiErrorBody>(
        { error: 'VALIDATION_ERROR', message: 'Message content cannot be empty.' },
        { status: 400 }
      );
    }

    const ticket = db.getTicket(params.id as string);
    if (!ticket) {
      return HttpResponse.json<ApiErrorBody>(
        { error: 'NOT_FOUND', message: `No ticket with id ${params.id}` },
        { status: 404 }
      );
    }

    const message = db.addMessage(params.id as string, body.content, 'agent');
    return HttpResponse.json(message, { status: 201 });
  }),
];
