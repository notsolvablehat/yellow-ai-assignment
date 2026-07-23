import { useState, useEffect, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/layout/Header';
import { Sidebar, type NavTab } from './components/layout/Sidebar';
import { SearchModal } from './components/layout/SearchModal';
import { ShortcutsDialog } from './components/layout/ShortcutsDialog';
import { Inbox } from './components/inbox/Inbox';
import { TicketDetailView } from './components/detail/TicketDetailView';
import { useTickets, useUpdateTicketStatus } from './hooks/useTickets';
import type { SortKey } from './types/ticket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

import { Toaster, toast } from 'sonner';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<NavTab>('inbox');
  const [currentSort, setCurrentSort] = useState<SortKey>('priority');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const ticketsParams = {
    status: activeTab === 'resolved' ? ('resolved' as const) : undefined,
    sort: currentSort,
  };

  const {
    data: tickets,
    isLoading,
    isError,
    error,
    refetch,
  } = useTickets(ticketsParams);

  const updateStatusMutation = useUpdateTicketStatus();

  const activeTicketId = selectedTicketId ?? tickets?.[0]?.id ?? null;

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
    setMobileView('detail');
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setSelectedTicketId(null);
    setMobileView('list');
  };

  const selectNextTicket = useCallback(() => {
    if (!tickets || tickets.length === 0 || !activeTicketId) return;
    const idx = tickets.findIndex((t) => t.id === activeTicketId);
    if (idx < tickets.length - 1) {
      handleSelectTicket(tickets[idx + 1].id);
    }
  }, [tickets, activeTicketId]);

  const selectPrevTicket = useCallback(() => {
    if (!tickets || tickets.length === 0 || !activeTicketId) return;
    const idx = tickets.findIndex((t) => t.id === activeTicketId);
    if (idx > 0) {
      handleSelectTicket(tickets[idx - 1].id);
    }
  }, [tickets, activeTicketId]);

  const resolveCurrentTicket = useCallback(() => {
    if (!activeTicketId) return;
    const currentTicket = tickets?.find((t) => t.id === activeTicketId);
    if (!currentTicket || currentTicket.status === 'resolved') return;

    updateStatusMutation.mutate(
      { id: activeTicketId, status: 'resolved' },
      {
        onSuccess: () => {
          toast.success('Ticket resolved — moved to next');
          // After resolve, auto-move to next ticket
          selectNextTicket();
        },
      }
    );
  }, [activeTicketId, tickets, updateStatusMutation, selectNextTicket]);

  useHotkeys('ctrl+m', (e) => {
    e.preventDefault();
    if (!isSearchModalOpen) setIsShortcutsDialogOpen(true);
  }, { enableOnFormTags: false });

  useEffect(() => {
    const handleNativeKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        const activeEl = document.activeElement as HTMLElement | null;
        const isInput =
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.isContentEditable);
        if (!isInput) {
          e.preventDefault();
          setIsShortcutsDialogOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleNativeKeyDown);
    return () => window.removeEventListener('keydown', handleNativeKeyDown);
  }, []);

  // Ctrl+K / Cmd+K → Search modal
  useHotkeys('ctrl+k, meta+k', (e) => {
    e.preventDefault();
    setIsSearchModalOpen((prev) => !prev);
  }, { enableOnFormTags: false });

  // Ctrl+. → Resolve current ticket (not when typing)
  useHotkeys('ctrl+period', (e) => {
    e.preventDefault();
    resolveCurrentTicket();
  }, { enableOnFormTags: false });

  // Ctrl+Down → Next ticket (not when typing)
  useHotkeys('ctrl+down', (e) => {
    e.preventDefault();
    selectNextTicket();
  }, { enableOnFormTags: false });

  // Ctrl+Up → Previous ticket (not when typing)
  useHotkeys('ctrl+up', (e) => {
    e.preventDefault();
    selectPrevTicket();
  }, { enableOnFormTags: false });

  // Escape → close modals
  useHotkeys('escape', () => {
    if (isSearchModalOpen) setIsSearchModalOpen(false);
    else if (isShortcutsDialogOpen) setIsShortcutsDialogOpen(false);
  }, { enableOnFormTags: true });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* Header */}
      <Header
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
        onOpenShortcuts={() => setIsShortcutsDialogOpen(true)}
      />

      {/* Search Modal Overlay */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectTicket={handleSelectTicket}
      />

      {/* Shortcuts / Debug Dialog */}
      <ShortcutsDialog
        isOpen={isShortcutsDialogOpen}
        onClose={() => setIsShortcutsDialogOpen(false)}
      />

      {/* Toast notifications */}
      <Toaster position="top-right" richColors />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Pane (Responsive Layout for Mobile vs Desktop) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Inbox List (Always visible on Desktop; on Mobile visible when mobileView === 'list') */}
          <div
            className={`flex-1 lg:flex-none h-full ${
              mobileView === 'list' ? 'block' : 'hidden lg:block'
            }`}
          >
            <Inbox
              activeTab={activeTab}
              tickets={tickets}
              isLoading={isLoading}
              isError={isError}
              error={error as Error | null}
              onRetry={() => refetch()}
              selectedTicketId={activeTicketId}
              onSelectTicket={handleSelectTicket}
              currentSort={currentSort}
              onSortChange={setCurrentSort}
            />
          </div>

          {/* Ticket Detail (Always visible on Desktop; on Mobile visible when mobileView === 'detail') */}
          <div
            className={`flex-1 h-full overflow-hidden ${
              mobileView === 'detail' ? 'block' : 'hidden lg:block'
            }`}
          >
            <TicketDetailView
              ticketId={activeTicketId}
              isInboxLoading={isLoading}
              onBackToInbox={() => setMobileView('list')}
              onSelectNextTicket={selectNextTicket}
              onResolveTicket={resolveCurrentTicket}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout />
    </QueryClientProvider>
  );
}
