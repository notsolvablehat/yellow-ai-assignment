import { Inbox, CheckCircle2, FileText, Clock, Settings, HelpCircle, X } from 'lucide-react';

export type NavTab = 'inbox' | 'resolved';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ activeTab, onSelectTab, isMobileOpen, onCloseMobile }: SidebarProps) {
  const navItems = [
    {
      id: 'inbox' as NavTab,
      label: 'Inbox',
      icon: Inbox,
      disabled: false,
    },
    {
      id: 'resolved' as NavTab,
      label: 'Resolved',
      icon: CheckCircle2,
      disabled: false,
    },
    {
      id: 'drafts',
      label: 'Drafts',
      icon: FileText,
      disabled: true,
    },
    {
      id: 'snoozed',
      label: 'Snoozed',
      icon: Clock,
      disabled: true,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border w-60 p-4">
      {/* Top Header / Workspace info */}
      <div className="flex items-center justify-between pb-6 border-b border-sidebar-border/60 mb-4">
        <div>
          <h2 className="font-heading font-bold text-base text-foreground">The Conversation Inbox</h2>
          <p className="text-xs text-muted-foreground font-medium">Triage Desk</p>
        </div>
        {isMobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.label}
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled && item.id) {
                  onSelectTab(item.id as NavTab);
                  onCloseMobile();
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.disabled
                  ? 'opacity-40 cursor-not-allowed text-sidebar-foreground/60'
                  : isActive
                  ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Nav Links */}
      <div className="pt-4 border-t border-sidebar-border/60 space-y-1">
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          onClick={() => {}}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </button>
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          onClick={() => {}}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>Support</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 z-10 w-64 shadow-xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
