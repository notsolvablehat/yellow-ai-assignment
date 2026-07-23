import { apiClient } from "./client";
import type {
   TicketSummary,
   TicketDetail,
   TicketStatus,
   GetTicketsParams,
} from "../types/ticket";

export async function getTickets(
   params?: GetTicketsParams,
): Promise<TicketSummary[]> {
   const response = await apiClient.get<TicketSummary[]>("/api/tickets", {
      params,
   });
   return response.data;
}

export async function getTicketById(id: string): Promise<TicketDetail> {
   const response = await apiClient.get<TicketDetail>(`/api/tickets/${id}`);
   return response.data;
}

export async function updateTicketStatus(
   id: string,
   status: TicketStatus,
): Promise<TicketSummary> {
   const response = await apiClient.patch<TicketSummary>(
      `/api/tickets/${id}/status`,
      { status },
   );
   return response.data;
}
