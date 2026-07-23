import { apiClient } from "./client";
import type { TicketSummary } from "../types/ticket";

export async function searchTickets(query: string): Promise<TicketSummary[]> {
   const response = await apiClient.get<TicketSummary[]>("/api/search", {
      params: { q: query },
   });
   return response.data;
}
