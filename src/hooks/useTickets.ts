import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTickets, getTicketById, updateTicketStatus } from "../api/tickets";
import { queryKeys } from "../api/queryKeys";
import type { GetTicketsParams, TicketStatus } from "../types/ticket";

export function useTickets(params?: GetTicketsParams) {
   return useQuery({
      queryKey: queryKeys.tickets.list(params),
      queryFn: () => getTickets(params),
   });
}

export function useTicket(id?: string) {
   return useQuery({
      queryKey: queryKeys.tickets.detail(id ?? ""),
      queryFn: () => getTicketById(id!),
      enabled: Boolean(id),
   });
}

export function useUpdateTicketStatus() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
         updateTicketStatus(id, status),
      onSuccess: (_, { id }) => {
         queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
         queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.detail(id),
         });
      },
   });
}
