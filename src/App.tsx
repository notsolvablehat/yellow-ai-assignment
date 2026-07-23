import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/layout/Header';
import { Sidebar, type NavTab } from './components/layout/Sidebar';
import { SearchModal } from './components/layout/SearchModal';
import { Inbox } from './components/inbox/Inbox';
import { TicketDetailView } from './components/detail/TicketDetailView';
import { useTickets } from './hooks/useTickets';
import type { SortKey } from './types/ticket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function MainLayout() {
  const [activeTab, setActiveTab] = useState<NavTab>('inbox');
  const [currentSort, setCurrentSort] = useState<SortKey>('priority');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Fetch tickets based on tab and sort
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

  // Auto-select first ticket if none selected
  useEffect(() => {
    if (tickets && tickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  // Global Ctrl+K / Cmd+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
    setMobileView('detail');
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setSelectedTicketId(null);
    setMobileView('list');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* Header */}
      <Header
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
      />

      {/* Search Modal Overlay */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectTicket={handleSelectTicket}
      />

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
              selectedTicketId={selectedTicketId}
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
              ticketId={selectedTicketId}
              onBackToInbox={() => setMobileView('list')}
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
