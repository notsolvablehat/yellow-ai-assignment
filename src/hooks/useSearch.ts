import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchTickets } from "../api/search";
import { queryKeys } from "../api/queryKeys";

export function useDebounce<T>(value: T, delayMs: number = 300): T {
   const [debouncedValue, setDebouncedValue] = useState<T>(value);

   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedValue(value);
      }, delayMs);

      return () => {
         clearTimeout(handler);
      };
   }, [value, delayMs]);

   return debouncedValue;
}

export function useSearchTickets(query: string, debounceMs: number = 300) {
   const debouncedQuery = useDebounce(query, debounceMs);

   return useQuery({
      queryKey: queryKeys.search.query(debouncedQuery),
      queryFn: () => searchTickets(debouncedQuery),
      enabled: debouncedQuery.trim().length > 0,
   });
}
