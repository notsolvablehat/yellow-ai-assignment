import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

export const searchHandlers = [
  // GET /api/search?q=sarah
  http.get('/api/search', async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? '';
    return HttpResponse.json(db.search(q));
  }),
];
