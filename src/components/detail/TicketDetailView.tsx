import { useState } from 'react';
import {
  ArrowLeft,
  Send,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Tag as TagIcon,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { useTicket, useUpdateTicketStatus } from '../../hooks/useTickets';
import { useTicketMessages, usePostMessage } from '../../hooks/useMessages';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { TicketSkeleton } from '../inbox/TicketSkeleton';

interface TicketDetailViewProps {
  ticketId: string | null;
  onBackToInbox: () => void;
}

export function TicketDetailView({ ticketId, onBackToInbox }: TicketDetailViewProps) {
  const [replyText, setReplyText] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);

  const { data: ticket, isLoading: isTicketLoading, isError: isTicketError, refetch: refetchTicket } = useTicket(
    ticketId ?? undefined
  );
  const { data: messages, isLoading: isMessagesLoading } = useTicketMessages(ticketId ?? undefined);

  const updateStatusMutation = useUpdateTicketStatus();
  const postMessageMutation = usePostMessage(ticketId ?? '');

  if (!ticketId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card/20 text-muted-foreground">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <UserCheck className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base text-foreground">No Ticket Selected</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Select a ticket from the inbox to view customer details, message history, and triage tools.
        </p>
      </div>
    );
  }

  if (isTicketLoading) {
    return (
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <TicketSkeleton />
      </div>
    );
  }

  if (isTicketError || !ticket) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
        <h3 className="font-semibold text-base text-foreground">Failed to load ticket details</h3>
        <button
          onClick={() => refetchTicket()}
          className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  // Handle status update (e.g. Resolve / Snooze / Reopen)
  const handleStatusChange = (newStatus: 'resolved' | 'snoozed' | 'open') => {
    setStatusError(null);
    updateStatusMutation.mutate(
      { id: ticket.id, status: newStatus },
      {
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Failed to update ticket status. Please try again.';
          setStatusError(msg);
        },
      }
    );
  };

  // Handle sending agent reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    postMessageMutation.mutate(replyText.trim(), {
      onSuccess: () => {
        setReplyText('');
      },
    });
  };

  // Initials for avatar
  const initials = ticket.customerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-card/10">
      {/* Mobile Back Button & Header */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToInbox}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden"
            title="Back to Inbox"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center text-sm shadow-2xs">
            {initials}
          </div>
          <div>
            <h2 className="font-heading font-bold text-base text-foreground leading-tight">
              {ticket.customerName}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {ticket.customer.email} • ID: #{ticket.id}
            </p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          {ticket.status !== 'resolved' ? (
            <button
              onClick={() => handleStatusChange('resolved')}
              disabled={updateStatusMutation.isPending}
              className="px-3 py-1.5 text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg transition-all shadow-2xs inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {updateStatusMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              <span>Resolve Issue</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('open')}
              disabled={updateStatusMutation.isPending}
              className="px-3 py-1.5 text-xs font-medium bg-muted text-foreground hover:bg-muted/80 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              Re-open Ticket
            </button>
          )}
        </div>
      </div>

      {/* Status Error Alert if Flaky Backend fails */}
      {statusError && (
        <div className="m-4 p-3 bg-rose-100 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            {statusError}
          </span>
          <button
            onClick={() => handleStatusChange('resolved')}
            className="font-semibold underline ml-2 hover:text-rose-950"
          >
            Retry Now
          </button>
        </div>
      )}

      <div className="p-4 space-y-4 flex-1 max-w-4xl w-full mx-auto">
        {/* Escalation Banner (e.g. Low CSAT) */}
        {ticket.escalationReason && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm text-amber-900 dark:text-amber-200">
                {ticket.escalationReason}
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-1">
                Customer expressed frustration regarding previous support response. Prioritize empathetic and clear resolution.
              </p>
            </div>
          </div>
        )}

        {/* Single Data Card: Customer Info & AI Summary */}
        <Card className="border border-border/80 shadow-2xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Customer Snapshot & AI Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {/* Customer Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/40 rounded-lg text-xs">
              <div>
                <span className="text-muted-foreground">Tier</span>
                <p className="font-semibold text-foreground mt-0.5">{ticket.customer.tier}</p>
              </div>
              <div>
                <span className="text-muted-foreground">LTV</span>
                <p className="font-semibold text-foreground mt-0.5 flex items-center">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                  {ticket.customer.lifetimeValueUsd?.toLocaleString() ?? 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Priority</span>
                <p className="font-semibold capitalize text-foreground mt-0.5">{ticket.priority}</p>
              </div>
              <div>
                <span className="text-muted-foreground">CSAT Score</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {ticket.csatScore ? `${ticket.csatScore}/5 ⭐` : 'N/A'}
                </p>
              </div>
            </div>

            {/* AI Summary */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                AI Context Summary
              </span>
              <p className="text-xs text-foreground/90 leading-relaxed bg-background p-3 rounded-lg border border-border/60">
                {ticket.aiSummary}
              </p>
            </div>

            {/* Suggested Reply if available */}
            {ticket.suggestedReply && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-accent-foreground uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Suggested AI Reply
                </span>
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs text-foreground flex items-start justify-between gap-2">
                  <p>{ticket.suggestedReply}</p>
                  <button
                    onClick={() => setReplyText(ticket.suggestedReply ?? '')}
                    className="text-[11px] font-semibold text-primary hover:underline shrink-0"
                  >
                    Use Reply
                  </button>
                </div>
              </div>
            )}

            {/* Tags Swatches */}
            {ticket.tags.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
                {ticket.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-2">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Thread History */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Conversation Thread
          </h3>

          {isMessagesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-3/4 rounded-xl" />
              <Skeleton className="h-16 w-3/4 ml-auto rounded-xl" />
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isAgent = msg.type === 'agent' || msg.type === 'ai';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-muted-foreground">
                      <span className="capitalize font-medium">{msg.type}</span>
                      <span>•</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-2xs ${
                        isAgent
                          ? 'bg-primary text-primary-foreground rounded-tr-xs'
                          : 'bg-card border border-border text-card-foreground rounded-tl-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-4">No messages yet.</div>
          )}
        </div>

        {/* Reply Input Box */}
        <form onSubmit={handleSendReply} className="pt-2">
          <div className="p-3 bg-card border border-border rounded-xl shadow-2xs space-y-2">
            <textarea
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${ticket.customerName}...`}
              className="w-full bg-transparent text-foreground text-xs placeholder:text-muted-foreground outline-none resize-none"
            />
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <span className="text-[11px] text-muted-foreground">Shift + Enter for new line</span>
              <button
                type="submit"
                disabled={!replyText.trim() || postMessageMutation.isPending}
                className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                {postMessageMutation.isPending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send Reply</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
