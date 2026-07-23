import { apiClient } from "./client";
import type { Message } from "../types/ticket";

export async function getTicketMessages(ticketId: string): Promise<Message[]> {
   const response = await apiClient.get<Message[]>(
      `/api/tickets/${ticketId}/messages`,
   );
   return response.data;
}

export async function postTicketMessage(
   ticketId: string,
   content: string,
): Promise<Message> {
   const response = await apiClient.post<Message>(
      `/api/tickets/${ticketId}/messages`,
      { content },
   );
   return response.data;
}
