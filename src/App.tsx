import { useState, useEffect, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { Header } from './components/layout/Header';
import { Sidebar, type NavTab } from './components/layout/Sidebar';
import { SearchModal } from './components/layout/SearchModal';
import { ShortcutsDialog } from './components/layout/ShortcutsDialog';
import { Inbox } from './components/inbox/Inbox';
import { TicketDetailView } from './components/detail/TicketDetailView';
import { useTickets, useUpdateTicketStatus } from './hooks/useTickets';
import type { SortKey, TicketStatus } from './types/ticket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

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
    if (id !== selectedTicketId) {
      updateStatusMutation.reset();
    }
    setSelectedTicketId(id);
    setMobileView('detail');
  };

  const handleTabChange = (tab: NavTab) => {
    updateStatusMutation.reset();
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

  const handleStatusChange = useCallback(
    (status: TicketStatus) => {
      if (!activeTicketId) return;
      updateStatusMutation.reset();
      updateStatusMutation.mutate(
        { id: activeTicketId, status },
        {
          onSuccess: () => {
            if (status === 'resolved') {
              toast.success('Ticket resolved — moved to next');
              selectNextTicket();
            } else {
              toast.success(`Ticket status updated to ${status}`);
            }
          },
        }
      );
    },
    [activeTicketId, updateStatusMutation, selectNextTicket]
  );

  const resolveCurrentTicket = useCallback(() => {
    if (!activeTicketId) return;
    const currentTicket = tickets?.find((t) => t.id === activeTicketId);
    if (!currentTicket || currentTicket.status === 'resolved') return;
    handleStatusChange('resolved');
  }, [activeTicketId, tickets, handleStatusChange]);

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

  useHotkeys('ctrl+k, meta+k', (e) => {
    e.preventDefault();
    setIsSearchModalOpen((prev) => !prev);
  }, { enableOnFormTags: false });

  useHotkeys('ctrl+period', (e) => {
    e.preventDefault();
    resolveCurrentTicket();
  }, { enableOnFormTags: false });

  useHotkeys('ctrl+down', (e) => {
    e.preventDefault();
    selectNextTicket();
  }, { enableOnFormTags: false });

  useHotkeys('ctrl+up', (e) => {
    e.preventDefault();
    selectPrevTicket();
  }, { enableOnFormTags: false });

  useHotkeys('escape', () => {
    if (isSearchModalOpen) setIsSearchModalOpen(false);
    else if (isShortcutsDialogOpen) setIsShortcutsDialogOpen(false);
  }, { enableOnFormTags: true });

  const isUpdatingStatus = updateStatusMutation.isPending;
  const updateStatusError = updateStatusMutation.error as Error | null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <Header
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
        onOpenShortcuts={() => setIsShortcutsDialogOpen(true)}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectTicket={handleSelectTicket}
      />

      <ShortcutsDialog
        isOpen={isShortcutsDialogOpen}
        onClose={() => setIsShortcutsDialogOpen(false)}
      />

      <Toaster position="top-right" richColors />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <div className="flex-1 flex overflow-hidden">
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
              error={error ?? null}
              onRetry={() => refetch()}
              selectedTicketId={activeTicketId}
              onSelectTicket={handleSelectTicket}
              currentSort={currentSort}
              onSortChange={setCurrentSort}
            />
          </div>

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
              onStatusChange={handleStatusChange}
              isUpdatingStatus={isUpdatingStatus}
              updateStatusError={updateStatusError}
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
