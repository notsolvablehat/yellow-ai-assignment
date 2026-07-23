import { useState, useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
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
import { useTicket } from '../../hooks/useTickets';
import { useTicketMessages, usePostMessage } from '../../hooks/useMessages';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Marker, MarkerContent } from '../ui/marker';
import { TicketSkeleton } from '../inbox/TicketSkeleton';
import type { TicketStatus } from '../../types/ticket';

interface TicketDetailViewProps {
  ticketId: string | null;
  isInboxLoading?: boolean;
  onBackToInbox: () => void;
  onSelectNextTicket: () => void;
  onResolveTicket: () => void;
  onStatusChange: (status: TicketStatus) => void;
  isUpdatingStatus?: boolean;
  updateStatusError?: Error | null;
}

export function TicketDetailView({
  ticketId,
  isInboxLoading,
  onBackToInbox,
  onSelectNextTicket,
  onResolveTicket,
  onStatusChange,
  isUpdatingStatus = false,
  updateStatusError = null,
}: TicketDetailViewProps) {
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data: ticket, isLoading: isTicketLoading, isError: isTicketError, refetch: refetchTicket } = useTicket(ticketId ?? undefined);
  const { data: messages, isLoading: isMessagesLoading } = useTicketMessages(ticketId ?? undefined);

  const postMessageMutation = usePostMessage(ticketId ?? '');

  useHotkeys(
    'ctrl+period',
    (e) => {
      e.preventDefault();
      onResolveTicket();
    },
    { enabled: Boolean(ticketId), enableOnFormTags: false }
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isInboxLoading || (isTicketLoading && ticketId)) {
    return (
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <Skeleton className="h-10 w-52 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <TicketSkeleton />
      </div>
    );
  }

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

  if (isTicketError || !ticket) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400" />
        <h3 className="font-semibold text-base text-foreground">Failed to load ticket details</h3>
        <button
          onClick={() => refetchTicket()}
          className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const sendReply = () => {
    if (!replyText.trim()) return;
    postMessageMutation.mutate(replyText.trim(), {
      onSuccess: () => setReplyText(''),
    });
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    sendReply();
  };

  const initials = ticket.customerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToInbox}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
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

        <div>
          {ticket.status !== 'resolved' ? (
            <button
              type="button"
              onClick={onResolveTicket}
              disabled={isUpdatingStatus}
              className="px-3.5 py-1.5 text-xs font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-full transition-all shadow-xs inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {isUpdatingStatus ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Resolve Issue</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStatusChange('open')}
              disabled={isUpdatingStatus}
              className="px-3.5 py-1.5 text-xs font-medium bg-muted text-foreground hover:bg-muted/80 rounded-full transition-colors inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {isUpdatingStatus ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              <span>Re-open Ticket</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {updateStatusError && (
          <div className="mx-4 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs text-rose-900 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate">{updateStatusError.message || 'Failed to update ticket status. Please try again.'}</span>
            </div>
            <button
              type="button"
              onClick={onResolveTicket}
              className="px-3 py-1 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors shrink-0 inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {ticket.escalationReason && (
          <div className="mx-4 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-amber-900">{ticket.escalationReason}</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Prioritise empathetic and clear resolution for AI-escalated inquiries.
              </p>
            </div>
          </div>
        )}

        <div className="px-4 pt-4">
          <Card className="border border-border/70 shadow-none bg-card rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border/60 py-3 px-4">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Customer Snapshot &amp; AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
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

              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">AI Summary</span>
                <p className="text-xs text-foreground/80 leading-relaxed bg-muted/40 rounded-xl p-3 border border-border/40">
                  {ticket.aiSummary}
                </p>
              </div>

              {ticket.suggestedReply && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />Suggested Reply
                  </span>
                  <div className="p-3 bg-accent/10 border border-accent/30 rounded-xl text-xs text-foreground flex items-start justify-between gap-3">
                    <p className="leading-relaxed">{ticket.suggestedReply}</p>
                    <button
                      onClick={() => setReplyText(ticket.suggestedReply ?? '')}
                      className="shrink-0 text-[11px] font-semibold text-primary hover:underline bg-amber-400 rounded-2xl p-2 cursor-pointer"
                    >
                      Use
                    </button>
                  </div>
                </div>
              )}

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

        <div className="px-4 py-4 space-y-4">
          {isMessagesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-3/4 rounded-2xl" />
              <Skeleton className="h-14 w-3/4 ml-auto rounded-2xl" />
              <Skeleton className="h-14 w-2/4 rounded-2xl" />
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => {
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
                    className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed shadow-xs ${
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

        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="shrink-0 border-t border-border bg-card p-3">
        <form onSubmit={handleSendReply} className="flex items-end gap-2">
          <div className="flex-1 bg-muted/40 border border-border/80 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 rounded-2xl p-3 transition-all">
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  if (replyText.trim()) {
                    postMessageMutation.mutate(replyText.trim(), {
                      onSuccess: () => {
                        setReplyText('');
                        onSelectNextTicket();
                      },
                    });
                  }
                  return;
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (replyText.trim()) sendReply();
                }
              }}
              placeholder={`Reply to ${ticket.customerName}...`}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={!replyText.trim() || postMessageMutation.isPending}
            aria-label="Send Reply"
            title="Send Reply"
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center shadow-xs transition-all disabled:opacity-40 shrink-0 mb-1 cursor-pointer"
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
