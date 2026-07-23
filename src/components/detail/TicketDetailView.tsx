import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Tag as TagIcon,
  UserCheck,
} from 'lucide-react';
import { useTicket, useUpdateTicketStatus } from '../../hooks/useTickets';
import { useTicketMessages, usePostMessage } from '../../hooks/useMessages';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Marker, MarkerContent } from '../ui/marker';
import { TicketSkeleton } from '../inbox/TicketSkeleton';

interface TicketDetailViewProps {
  ticketId: string | null;
  onBackToInbox: () => void;
}

export function TicketDetailView({ ticketId, onBackToInbox }: TicketDetailViewProps) {
  const [replyText, setReplyText] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data: ticket, isLoading: isTicketLoading, isError: isTicketError, refetch: refetchTicket } = useTicket(ticketId ?? undefined);
  const { data: messages, isLoading: isMessagesLoading } = useTicketMessages(ticketId ?? undefined);

  const updateStatusMutation = useUpdateTicketStatus();
  const postMessageMutation = usePostMessage(ticketId ?? '');

  // Auto-scroll to bottom of conversation thread when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!ticketId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4 ring-4 ring-border/40">
          <UserCheck className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base text-foreground">No Ticket Selected</h3>
        <p className="text-xs text-muted-foreground max-w-xs mt-1.5">
          Select a ticket from the inbox to view customer details and conversation history.
        </p>
      </div>
    );
  }

  if (isTicketLoading) {
    return (
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <Skeleton className="h-10 w-52 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <TicketSkeleton />
      </div>
    );
  }

  if (isTicketError || !ticket) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400" />
        <h3 className="font-semibold text-base text-foreground">Failed to load ticket details</h3>
        <button
          onClick={() => refetchTicket()}
          className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: 'resolved' | 'snoozed' | 'open') => {
    setStatusError(null);
    updateStatusMutation.mutate(
      { id: ticket.id, status: newStatus },
      {
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Failed to update status. Please try again.';
          setStatusError(msg);
        },
      }
    );
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    postMessageMutation.mutate(replyText.trim(), {
      onSuccess: () => setReplyText(''),
    });
  };

  const initials = ticket.customerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">

      {/* ── Sticky top header ── */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToInbox}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm ring-2 ring-primary/20">
            {initials}
          </div>
          <div>
            <h2 className="font-heading font-bold text-sm text-foreground leading-tight">{ticket.customerName}</h2>
            <p className="text-[11px] text-muted-foreground font-mono tracking-tight">
              {ticket.customer.email}&nbsp;•&nbsp;ID:&nbsp;#{ticket.id}
            </p>
          </div>
        </div>
        {/* Top Right Action: Resolve / Re-open Ticket */}
        <div>
          {ticket.status !== 'resolved' ? (
            <button
              type="button"
              onClick={() => handleStatusChange('resolved')}
              disabled={updateStatusMutation.isPending}
              className="px-3.5 py-1.5 text-xs font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-full transition-all shadow-xs inline-flex items-center gap-1.5 disabled:opacity-60"
            >
              {updateStatusMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Resolve Issue</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleStatusChange('open')}
              disabled={updateStatusMutation.isPending}
              className="px-3.5 py-1.5 text-xs font-medium bg-muted text-foreground hover:bg-muted/80 rounded-full transition-colors inline-flex items-center gap-1.5"
            >
              Re-open Ticket
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Status error banner */}
        {statusError && (
          <div className="mx-4 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              {statusError}
            </span>
            <button
              onClick={() => handleStatusChange('resolved')}
              className="font-semibold text-rose-700 hover:text-rose-900 underline ml-3 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Escalation banner */}
        {ticket.escalationReason && (
          <div className="mx-4 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-amber-900">{ticket.escalationReason}</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Customer expressed frustration regarding previous support response. Prioritise empathetic and clear resolution.
              </p>
            </div>
          </div>
        )}

        {/* Customer snapshot & AI summary card */}
        <div className="px-4 pt-4">
          <Card className="border border-border/70 shadow-none bg-card rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border/60 py-3 px-4">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Customer Snapshot &amp; AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Tier', value: ticket.customer.tier },
                  { label: 'LTV', value: ticket.customer.lifetimeValueUsd ? `$${ticket.customer.lifetimeValueUsd.toLocaleString()}` : 'N/A' },
                  { label: 'Priority', value: ticket.priority },
                  { label: 'CSAT', value: ticket.csatScore ? `${ticket.csatScore}/5` : 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5 bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                    <span className="text-xs font-semibold text-foreground capitalize">{value}</span>
                  </div>
                ))}
              </div>

              {/* AI summary */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">AI Summary</span>
                <p className="text-xs text-foreground/80 leading-relaxed bg-muted/40 rounded-xl p-3 border border-border/40">
                  {ticket.aiSummary}
                </p>
              </div>

              {/* Suggested reply */}
              {ticket.suggestedReply && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />Suggested Reply
                  </span>
                  <div className="p-3 bg-accent/10 border border-accent/30 rounded-xl text-xs text-foreground flex items-start justify-between gap-3">
                    <p className="leading-relaxed">{ticket.suggestedReply}</p>
                    <button
                      onClick={() => setReplyText(ticket.suggestedReply ?? '')}
                      className="shrink-0 text-[11px] font-semibold text-primary hover:underline"
                    >
                      Use
                    </button>
                  </div>
                </div>
              )}

              {/* Tags */}
              {ticket.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <TagIcon className="w-3 h-3 text-muted-foreground" />
                  {ticket.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages */}
        <div className="px-4 py-4 space-y-4">
          {isMessagesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-3/4 rounded-2xl" />
              <Skeleton className="h-14 w-3/4 ml-auto rounded-2xl" />
              <Skeleton className="h-14 w-2/4 rounded-2xl" />
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => {
              /* System message → Marker separator */
              if (msg.type === 'system') {
                return (
                  <Marker key={msg.id} variant="separator" className="my-2 text-[11px]">
                    <MarkerContent>{msg.content}</MarkerContent>
                  </Marker>
                );
              }

              const isAgent = msg.type === 'agent' || msg.type === 'ai';

              return (
                <div key={msg.id} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                  {/* Author + time label */}
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {!isAgent && (
                      <span className="text-[10px] font-semibold text-muted-foreground capitalize">
                        {msg.type === 'customer' ? ticket.customerName : msg.type}
                      </span>
                    )}
                    {isAgent && (
                      <span className="text-[10px] font-semibold text-muted-foreground capitalize">
                        {msg.type === 'ai' ? 'AI Agent' : 'Agent'}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/60">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isAgent
                        ? msg.type === 'ai'
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                          : 'bg-secondary text-secondary-foreground rounded-2xl rounded-tr-sm'
                        : 'bg-card border border-border text-foreground rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No messages yet.</p>
          )}
        </div>

        {/* Bottom anchor for auto-scrolling */}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* ── Sticky footer: reply input & send button ── */}
      <div className="shrink-0 border-t border-border bg-card p-3">
        <form onSubmit={handleSendReply} className="flex items-end gap-2">
          <div className="flex-1 bg-muted/40 border border-border/80 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 rounded-2xl p-3 transition-all">
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (replyText.trim()) handleSendReply(e as any);
                }
              }}
              placeholder={`Reply to ${ticket.customerName}...`}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!replyText.trim() || postMessageMutation.isPending}
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center shadow-sm transition-all disabled:opacity-40 shrink-0 mb-1"
            title="Send Reply"
          >
            {postMessageMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
