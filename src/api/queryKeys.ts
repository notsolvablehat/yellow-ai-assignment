import type { GetTicketsParams } from "../types/ticket";

export const queryKeys = {
   tickets: {
      all: ["tickets"] as const,
      list: (params?: GetTicketsParams) => ["tickets", "list", params] as const,
      detail: (id: string) => ["tickets", "detail", id] as const,
   },
   messages: {
      list: (ticketId: string) => ["messages", ticketId] as const,
   },
   search: {
      query: (q: string) => ["search", q] as const,
   },
};
