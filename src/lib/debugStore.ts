/**
 * Debug / Simulation Store
 *
 * A plain JS singleton that MSW handlers and the ShortcutsDialog both read/write.
 * Kept outside React so MSW service-worker handlers can import it directly at
 * request time without needing React context.
 *
 * ResolveMode per ticket:
 *  - 'normal'       → default, real db.updateStatus() logic runs
 *  - 'flaky'        → fails once, then succeeds (per ticket, resets on reset())
 *  - 'always-error' → every resolve attempt returns 500
 */

export type ResolveMode = 'normal' | 'flaky' | 'always-error';

interface DebugStore {
  /** GET /api/tickets always returns 500 when true */
  fetchFailure: boolean;
  /** ALL PATCH /api/tickets/:id/status calls return 500 when true */
  resolveFailure: boolean;
  /** Per-ticket resolve behaviour override */
  perTicketMode: Record<string, ResolveMode>;
  /** Tracks which tickets have already failed once (for 'flaky' mode) */
  flakyHasFailed: Set<string>;
}

export const debugStore: DebugStore = {
  fetchFailure: false,
  resolveFailure: false,
  perTicketMode: {},
  flakyHasFailed: new Set(),
};

export function setFetchFailureStore(val: boolean) {
  debugStore.fetchFailure = val;
}

export function setResolveFailureStore(val: boolean) {
  debugStore.resolveFailure = val;
}

export function setPerTicketModeStore(ticketId: string, mode: ResolveMode) {
  if (mode === 'normal') {
    delete debugStore.perTicketMode[ticketId];
  } else {
    debugStore.perTicketMode[ticketId] = mode;
  }
}

/** Called by ShortcutsDialog when the user resets simulation state */
export function resetDebugStore() {
  debugStore.fetchFailure = false;
  debugStore.resolveFailure = false;
  debugStore.perTicketMode = {};
  debugStore.flakyHasFailed.clear();
}
