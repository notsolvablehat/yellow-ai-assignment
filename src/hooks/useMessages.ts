import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTicketMessages, postTicketMessage } from "../api/messages";
import { queryKeys } from "../api/queryKeys";

export function useTicketMessages(ticketId?: string) {
   return useQuery({
      queryKey: queryKeys.messages.list(ticketId ?? ""),
      queryFn: () => getTicketMessages(ticketId!),
      enabled: Boolean(ticketId),
   });
}

export function usePostMessage(ticketId: string) {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (content: string) => postTicketMessage(ticketId, content),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: queryKeys.messages.list(ticketId),
         });
         queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      },
   });
}
