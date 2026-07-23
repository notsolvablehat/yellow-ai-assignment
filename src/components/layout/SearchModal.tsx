import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Search, X, Clock } from 'lucide-react';
import { useSearchTickets } from '../../hooks/useSearch';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import type { TicketSummary } from '../../types/ticket';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicket: (ticketId: string) => void;
}

export function SearchModal({ isOpen, onClose, onSelectTicket }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useSearchTickets(query);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  useHotkeys('escape', handleClose, { enabled: isOpen, enableOnFormTags: true });

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    onSelectTicket(id);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-border bg-background/50">
          <Search className="w-5 h-5 text-muted-foreground shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets, customers, or tags..."
            autoFocus
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-muted rounded-full text-muted-foreground mr-1 cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="ml-2 p-1 hover:bg-muted rounded-lg text-muted-foreground cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {!query.trim() && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Type to search by customer name, ticket content, or tags...
            </div>
          )}

          {query.trim() && isLoading && (
            <div className="space-y-3 py-2">
              <div className="text-xs font-medium text-muted-foreground px-1">Searching...</div>
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          )}

          {query.trim() && !isLoading && results && results.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No tickets found matching "{query}"
            </div>
          )}

          {query.trim() && !isLoading && results && results.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground px-1">
                Found {results.length} result{results.length > 1 ? 's' : ''}
              </div>
              {results.map((ticket: TicketSummary) => (
                <button
                  type="button"
                  key={ticket.id}
                  onClick={() => handleSelect(ticket.id)}
                  className="w-full text-left group flex flex-col p-3 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-accent/10 cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <span>{ticket.customerName}</span>
                      <span className="text-xs text-muted-foreground font-normal">#{ticket.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ticket.waitTimeMinutes}m wait
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {ticket.lastMessagePreview}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] py-0 px-2">
                      {ticket.escalationReason}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] py-0 px-2 ${
                        ticket.priority === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : ticket.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Press <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">ESC</kbd> to close</span>
          <span>Click result to view ticket detail</span>
        </div>
      </div>
    </div>
  );
}
