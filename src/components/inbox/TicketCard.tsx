import type { TicketSummary, TicketPriority } from '../../types/ticket';
import { Badge } from '../ui/badge';

interface TicketCardProps {
  ticket: TicketSummary;
  isSelected: boolean;
  onSelect: (ticketId: string) => void;
}

export function TicketCard({ ticket, isSelected, onSelect }: TicketCardProps) {
  const formattedTime = ticket.waitTimeMinutes >= 60
    ? `${Math.floor(ticket.waitTimeMinutes / 60)}h`
    : `${ticket.waitTimeMinutes}m`;

  const getPriorityDot = (priority: TicketPriority) => {
    switch (priority) {
      case 'high': return 'bg-rose-500 ring-rose-200';
      case 'medium': return 'bg-amber-400 ring-amber-200';
      default: return 'bg-slate-300 ring-slate-100';
    }
  };

  const getEscalationBadge = (reason: string) => {
    const lower = reason.toLowerCase();
    if (lower.includes('csat'))
      return 'bg-amber-100 text-amber-900 border-amber-200';
    if (lower.includes('escalated') || lower.includes('urgent'))
      return 'bg-rose-100 text-rose-900 border-rose-200';
    return 'bg-secondary/10 text-secondary border-secondary/20';
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(ticket.id)}
      aria-selected={isSelected}
      aria-label={`Ticket ${ticket.id} from ${ticket.customerName}`}
      className={`w-full text-left relative flex flex-col gap-2 p-3.5 rounded-xl cursor-pointer transition-all border outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isSelected
          ? 'bg-[#E4DBFD] shadow-sm border-[#29165E33]'
          : 'bg-card hover:bg-muted/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm text-foreground tracking-tight line-clamp-1">
          {ticket.customerName}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-muted-foreground tabular-nums">{formattedTime}</span>
          <span
            title={`Priority: ${ticket.priority}`}
            className={`w-2 h-2 rounded-full ring-2 shrink-0 ${getPriorityDot(ticket.priority)}`}
          />
        </div>
      </div>

      <Badge
        variant="outline"
        className={`w-fit text-[11px] font-medium py-0.5 px-2 rounded-md ${getEscalationBadge(ticket.escalationReason)}`}
      >
        {ticket.escalationReason}
      </Badge>

      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {ticket.lastMessagePreview}
      </p>
    </button>
  );
}
