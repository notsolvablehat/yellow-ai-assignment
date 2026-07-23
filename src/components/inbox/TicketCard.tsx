import type { TicketSummary, TicketPriority } from '../../types/ticket';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface TicketCardProps {
  ticket: TicketSummary;
  isSelected: boolean;
  onSelect: (ticketId: string) => void;
}

export function TicketCard({ ticket, isSelected, onSelect }: TicketCardProps) {
  // Format wait time / message time
  const formattedTime = ticket.waitTimeMinutes >= 60
    ? `${Math.floor(ticket.waitTimeMinutes / 60)}h`
    : `${ticket.waitTimeMinutes}m`;

  // Priority Dot styles
  const getPriorityDot = (priority: TicketPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500 ring-rose-200';
      case 'medium':
        return 'bg-amber-400 ring-amber-200';
      case 'low':
      default:
        return 'bg-slate-400 ring-slate-200';
    }
  };

  // Escalation Badge styles
  const getEscalationBadge = (reason: string) => {
    const lower = reason.toLowerCase();
    if (lower.includes('csat')) {
      return 'bg-amber-100 text-amber-900 border-amber-300 font-medium';
    }
    if (lower.includes('escalated') || lower.includes('high') || lower.includes('urgent')) {
      return 'bg-rose-100 text-rose-900 border-rose-300 font-medium';
    }
    return 'bg-purple-100 text-purple-900 border-purple-200 font-medium';
  };

  return (
    <Card
      onClick={() => onSelect(ticket.id)}
      className={`p-4 cursor-pointer transition-all border relative group ${
        isSelected
          ? 'bg-purple-50/80 border-primary/60 ring-2 ring-primary/20 shadow-xs'
          : 'bg-card hover:bg-muted/40 border-border/80 hover:border-primary/40'
      }`}
    >
      {/* Top Header: Customer Name & Priority Dot + Time */}
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-sm text-foreground tracking-tight line-clamp-1">
          {ticket.customerName}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground font-medium">{formattedTime}</span>
          <span
            title={`Priority: ${ticket.priority}`}
            className={`w-2.5 h-2.5 rounded-full ring-2 ${getPriorityDot(ticket.priority)}`}
          />
        </div>
      </div>

      {/* Escalation Reason Badge */}
      <div className="mt-2">
        <Badge variant="outline" className={`text-xs py-0.5 px-2.5 rounded-md ${getEscalationBadge(ticket.escalationReason)}`}>
          {ticket.escalationReason}
        </Badge>
      </div>

      {/* Last Message Preview */}
      <p className="text-xs text-muted-foreground line-clamp-2 mt-2.5 leading-relaxed">
        {ticket.lastMessagePreview}
      </p>

      {/* Tags Swatches (if present on Detail or summary tags) */}
      <div className="flex flex-wrap gap-1 mt-3">
        <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground font-medium rounded-full border border-border/40">
          #{ticket.id}
        </span>
        <span className="text-[10px] px-2 py-0.5 bg-secondary/10 text-secondary font-medium rounded-full">
          {ticket.status}
        </span>
      </div>
    </Card>
  );
}
