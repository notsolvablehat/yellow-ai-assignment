import { Search, Menu, HelpCircle } from 'lucide-react';
import { Kbd } from '../ui/kbd';

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleMobileMenu: () => void;
  onOpenShortcuts: () => void;
}

export function Header({ onOpenSearch, onToggleMobileMenu, onOpenShortcuts }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xs flex items-center justify-between px-4 sticky top-0 z-30">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="font-heading font-bold text-base text-foreground tracking-tight leading-tight">
            The Conversation Inbox
          </h1>
          <span className="text-[11px] text-muted-foreground font-medium">
            Triage Desk
          </span>
        </div>
      </div>

      {/* Middle: Searchbar with Filters inside right end */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={onOpenSearch}
          className="w-full h-9 px-3 rounded-full bg-background border border-input hover:border-primary/50 text-left text-sm text-muted-foreground flex items-center justify-between transition-colors shadow-2xs group"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
            <span className="truncate">Search...</span>
            <Kbd className="text-[10px] px-1.5 py-0.5 hidden sm:inline-block">CTRL+K</Kbd>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              onOpenSearch();
            }}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground pl-2 border-l border-border shrink-0"
              >

          </div>
        </button>
      </div>

      {/* Right: Shortcuts & Debug Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenShortcuts}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg border border-border transition-colors shadow-2xs"
          title="Shortcuts & Debug Controls (?)"
        >
          <HelpCircle className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">Debug / Shortcuts</span>
          <Kbd className="text-[10px] px-1 py-0.5 ml-0.5">?</Kbd>
        </button>
      </div>
    </header>
  );
}
