import { AlertCircle, RefreshCw, Inbox as InboxIcon } from 'lucide-react';
import type { TicketSummary, SortKey, TicketStatus } from '../../types/ticket';
import { TicketCard } from './TicketCard';
import { TicketSkeleton } from './TicketSkeleton';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '../ui/empty';
import { Badge } from '../ui/badge';
import type { NavTab } from '../layout/Sidebar';

interface InboxProps {
  activeTab: NavTab;
  tickets: TicketSummary[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
  currentSort: SortKey;
  onSortChange: (sort: SortKey) => void;
  currentStatusFilter?: TicketStatus;
}

export function Inbox({
  activeTab,
  tickets,
  isLoading,
  isError,
  error,
  onRetry,
  selectedTicketId,
  onSelectTicket,
  currentSort,
  onSortChange,
}: InboxProps) {
  // Compute open/urgent count for top badge
  const needActionCount = tickets?.filter((t) => t.status === 'open' || t.status === 're-escalated').length ?? 0;

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'priority', label: 'Priority' },
    { key: 'wait_time', label: 'Wait time' },
    { key: 'recent', label: 'Recent' },
  ];

  return (
    <div className="flex flex-col h-full bg-background border-r border-border w-full lg:w-96 shrink-0">
      {/* Top Header & Sort Segmented Control */}
      <div className="p-4 border-b border-border space-y-3 bg-card/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="font-heading font-bold text-lg text-foreground capitalize">
              {activeTab === 'resolved' ? 'Resolved' : 'Inbox'}
            </h2>
            {activeTab === 'inbox' && (
              <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-2.5 py-0.5 rounded-full shadow-2xs">
                {needActionCount} need you now
              </Badge>
            )}
          </div>
        </div>

        {/* Sort Pill Buttons */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-xl">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onSortChange(opt.key)}
              className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all text-center ${
                currentSort === opt.key
                  ? 'bg-card text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List Body / 4 States */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {/* State 1: Loading State */}
        {isLoading && (
          <div className="space-y-3">
            <TicketSkeleton />
            <TicketSkeleton />
            <TicketSkeleton />
            <TicketSkeleton />
          </div>
        )}

        {/* State 2: Fail State */}
        {!isLoading && isError && (
          <div className="p-6 my-4 text-center border border-rose-200 bg-rose-50/50 rounded-xl space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-sm text-rose-900">Failed to load tickets</h3>
              <p className="text-xs text-rose-700 mt-1">
                {error?.message || 'Something went wrong fetching data.'}
              </p>
            </div>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* State 3: Empty State */}
        {!isLoading && !isError && tickets && tickets.length === 0 && (
          <Empty className="py-12 border-0 bg-transparent">
            <EmptyMedia variant="icon" className="bg-muted">
              <InboxIcon className="w-5 h-5 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle className="text-base font-semibold">No tickets found</EmptyTitle>
              <EmptyDescription className="text-xs">
                {activeTab === 'resolved'
                  ? 'There are currently no resolved tickets.'
                  : 'Your inbox is clear! No active tickets need attention.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {/* State 4: Success State (True State) */}
        {!isLoading && !isError && tickets && tickets.length > 0 && (
          <div className="space-y-2.5">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isSelected={selectedTicketId === ticket.id}
                onSelect={onSelectTicket}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
