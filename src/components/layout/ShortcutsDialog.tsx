import { useState, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  Command,
  ToggleLeft,
  ToggleRight,
  Keyboard,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select';
import { Kbd, KbdGroup } from '../ui/kbd';
import { Badge } from '../ui/badge';
import {
  debugStore,
  resetDebugStore,
  setFetchFailureStore,
  setResolveFailureStore,
  setPerTicketModeStore,
  type ResolveMode,
} from '../../lib/debugStore';
import { seedTickets } from '../../mocks/data/seed';

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Local state mirrors the debugStore singleton so the UI is reactive ──
interface LocalDebugState {
  fetchFailure: boolean;
  resolveFailure: boolean;
  perTicketMode: Record<string, ResolveMode>;
}

const RESOLVE_MODE_OPTIONS: { value: ResolveMode; label: string; description: string }[] = [
  { value: 'normal', label: 'Normal', description: 'Resolves successfully' },
  { value: 'flaky', label: 'Flaky', description: 'Fails once, then succeeds' },
  { value: 'always-error', label: 'Always Error', description: 'Every resolve attempt fails' },
];

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], label: 'Open search modal' },
  { keys: ['Ctrl', '.'], label: 'Resolve current ticket' },
  { keys: ['Ctrl', 'Enter'], label: 'Send reply & go to next ticket' },
  { keys: ['Ctrl', '↓'], label: 'Select next ticket' },
  { keys: ['Ctrl', '↑'], label: 'Select previous ticket' },
  { keys: ['Esc'], label: 'Close modal / search' },
  { keys: ['Ctrl', 'M'], label: 'Show this dialog (or click Debug button)' },
];

export function ShortcutsDialog({ isOpen, onClose }: ShortcutsDialogProps) {
  const [localDebug, setLocalDebug] = useState<LocalDebugState>(() => ({
    fetchFailure: debugStore.fetchFailure,
    resolveFailure: debugStore.resolveFailure,
    perTicketMode: { ...debugStore.perTicketMode },
  }));
  const [activeSection, setActiveSection] = useState<'shortcuts' | 'controls'>('shortcuts');

  // Sync on open
  const syncFromStore = useCallback(() => {
    setLocalDebug({
      fetchFailure: debugStore.fetchFailure,
      resolveFailure: debugStore.resolveFailure,
      perTicketMode: { ...debugStore.perTicketMode },
    });
  }, []);

  // Close on Escape
  useHotkeys('escape', onClose, { enabled: isOpen, enableOnFormTags: true });

  const setFetchFailure = (val: boolean) => {
    setFetchFailureStore(val);
    setLocalDebug((s) => ({ ...s, fetchFailure: val }));
  };

  const setResolveFailure = (val: boolean) => {
    setResolveFailureStore(val);
    setLocalDebug((s) => ({ ...s, resolveFailure: val }));
  };

  const setPerTicketMode = (ticketId: string, mode: ResolveMode) => {
    setPerTicketModeStore(ticketId, mode);
    setLocalDebug((s) => ({
      ...s,
      perTicketMode: { ...debugStore.perTicketMode },
    }));
  };

  const handleReset = () => {
    resetDebugStore();
    syncFromStore();
  };

  const hasActiveSimulation =
    localDebug.fetchFailure ||
    localDebug.resolveFailure ||
    Object.keys(localDebug.perTicketMode).length > 0;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton
        className="sm:max-w-4xl max-w-4xl w-full p-0 overflow-hidden rounded-2xl gap-0"
      >
        {/* ── Header ── */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Keyboard className="w-4 h-4 text-primary" />
            Keyboard Shortcuts &amp; Debug Controls
            {hasActiveSimulation && (
              <Badge className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                Simulation Active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* ── Tab bar ── */}
        <div className="flex border-b border-border bg-muted/30">
          <button
            onClick={() => setActiveSection('shortcuts')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              activeSection === 'shortcuts'
                ? 'text-foreground border-b-2 border-primary bg-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Keyboard Shortcuts
          </button>
          <button
            onClick={() => setActiveSection('controls')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              activeSection === 'controls'
                ? 'text-foreground border-b-2 border-primary bg-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Simulation Controls
            {hasActiveSimulation && (
              <span className="ml-1.5 inline-flex h-2 w-2 rounded-full bg-amber-500" />
            )}
          </button>
        </div>

        {/* ── Shortcuts Panel ── */}
        {activeSection === 'shortcuts' && (
          <div className="px-5 py-4 space-y-1.5">
            {SHORTCUTS.map(({ keys, label }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
              >
                <span className="text-sm text-foreground">{label}</span>
                <KbdGroup className="gap-1">
                  {keys.map((k) => (
                    <Kbd key={k} className="text-[11px] px-1.5 py-0.5">
                      {k === 'Ctrl' ? (
                        <span className="flex items-center gap-0.5">
                          <Command className="w-2.5 h-2.5" />
                          Ctrl
                        </span>
                      ) : (
                        k
                      )}
                    </Kbd>
                  ))}
                </KbdGroup>
              </div>
            ))}

            <p className="pt-2 text-[11px] text-muted-foreground">
              Hotkeys are disabled when focus is inside an input or textarea.
            </p>
          </div>
        )}

        {/* ── Controls Panel ── */}
        {activeSection === 'controls' && (
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="px-5 py-4 space-y-5">
              {/* Global toggles */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Global Simulation
                </h3>

                <SimToggle
                  label="Simulate Fetch Failure"
                  description="GET /api/tickets always returns 500 — inbox shows error state"
                  active={localDebug.fetchFailure}
                  onToggle={() => setFetchFailure(!localDebug.fetchFailure)}
                  danger
                />

                <SimToggle
                  label="Simulate All Resolve Failures"
                  description="Every resolve attempt returns 500 regardless of ticket"
                  active={localDebug.resolveFailure}
                  onToggle={() => setResolveFailure(!localDebug.resolveFailure)}
                  danger
                />
              </div>

              {/* Per-ticket overrides */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  Per-Ticket Resolve Behaviour
                  <span className="text-muted-foreground font-normal normal-case">
                    Overrides global setting
                  </span>
                </h3>

                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50 text-muted-foreground">
                        <th className="text-left px-3 py-2 font-semibold">Ticket</th>
                        <th className="text-left px-3 py-2 font-semibold">Customer</th>
                        <th className="text-right px-3 py-2 font-semibold">Resolve Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seedTickets.map((ticket) => {
                        const currentMode = localDebug.perTicketMode[ticket.id] ?? 'normal';
                        return (
                          <tr
                            key={ticket.id}
                            className="border-t border-border/60 hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-3 py-2.5 font-mono text-muted-foreground">
                              {ticket.id}
                            </td>
                            <td className="px-3 py-2.5 text-foreground font-medium">
                              {ticket.customerName}
                            </td>
                            <td className="px-3 py-2.5">
                              <ResolveModeSelect
                                value={currentMode}
                                onChange={(mode) => setPerTicketMode(ticket.id, mode)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reset button */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset All Simulations
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer hint ── */}
        <div className="px-5 py-2.5 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Press <Kbd className="text-[10px] px-1 py-0.5">Esc</Kbd> to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}


function SimToggle({
  label,
  description,
  active,
  onToggle,
  danger = false,
}: {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-all text-left ${
        active
          ? danger
            ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/30 dark:border-rose-800'
            : 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
          : 'bg-muted/40 border-border hover:bg-muted'
      }`}
    >
      <div className="space-y-0.5 min-w-0">
        <div
          className={`text-xs font-semibold flex items-center gap-1.5 ${
            active ? (danger ? 'text-rose-900' : 'text-emerald-900') : 'text-foreground'
          }`}
        >
          {active && danger && <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />}
          {label}
        </div>
        <p className={`text-[11px] ${active ? (danger ? 'text-rose-700' : 'text-emerald-700') : 'text-muted-foreground'}`}>
          {description}
        </p>
      </div>
      <div className="shrink-0">
        {active ? (
          <ToggleRight
            className={`w-8 h-8 ${danger ? 'text-rose-500' : 'text-emerald-500'}`}
          />
        ) : (
          <ToggleLeft className="w-8 h-8 text-muted-foreground/50" />
        )}
      </div>
    </button>
  );
}



function ResolveModeSelect({
  value,
  onChange,
}: {
  value: ResolveMode;
  onChange: (mode: ResolveMode) => void;
}) {
  const colorClass =
    value === 'always-error'
      ? 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
      : value === 'flaky'
      ? 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
      : 'text-foreground bg-muted/50 border-border';

  return (
    <Select value={value} onValueChange={(val) => onChange(val as ResolveMode)}>
      <SelectTrigger className={`w-[130px] h-7 text-[11px] font-semibold ${colorClass}`}>
        <SelectValue placeholder="Select mode" />
      </SelectTrigger>
      <SelectContent align="end">
        {RESOLVE_MODE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <div className="flex flex-col">
              <span className="font-semibold text-xs">{opt.label}</span>
              <span className="text-[10px] text-muted-foreground">{opt.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
