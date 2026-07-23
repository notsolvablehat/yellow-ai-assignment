# The Conversation Inbox - Yellow.ai Assignment

A purpose-built triage view designed for CX agents to handle AI-escalated customer conversations. The goal of this inbox is speed and context—agents need to instantly know *why* a ticket is in their queue and resolve it without leaving their keyboard.

## Live Demo

**[View the Live Application](https://yellow-ai.mohammedyaseenagha.in/)**
*(Hosted on Vercel)*

## Setup & Run

This project uses [Bun](https://bun.sh/) (or your preferred package manager like npm/yarn) and Vite.

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start the development server:**
   ```bash
   bun run dev
   ```

3. **Build for production:**
   ```bash
   bun run build
   ```

## Tech Stack

- **Core:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, custom CSS variables, class-variance-authority
- **Components:** Radix UI primitives (via shadcn/ui), Lucide React (icons)
- **State & Data Fetching:** TanStack React Query v5
- **Mock Backend:** MSW (Mock Service Worker) for API simulation (delay, errors)
- **Shortcuts:** `react-hotkeys-hook`

## Product Decisions

The primary focus of this build was **Agent Speed and Context**. Instead of building a generic CRUD email client, the UI prioritizes the information an agent actually needs to triage a frustrated user:

1. **Surface Critical Context:** Escalation reasons (e.g., "CSAT Drop", "Frustrated User"), Customer LTV, Priority, and AI summaries are placed at the very top of the ticket. Agents don't have to read the entire chat history to know what's wrong.
2. **Action-Oriented AI:** Added a "Suggested Reply" block with a one-click "Use" button that populates the reply box.
3. **Responsive by Default:** CX agents might have half-screen windows open. The layout gracefully downgrades from a side-by-side view to a single-pane mobile view.
4. **Keyboard-First Navigation:** Triage requires speed. Everything from navigating between tickets to sending replies and resolving them can be done without touching the mouse.

## Keyboard Shortcuts

- `Ctrl + .` : Resolve the current ticket
- `Ctrl + Down` : Move to the next ticket
- `Ctrl + Up` : Move to the previous ticket
- `Ctrl + K` or `Cmd + K` : Open search/filter modal
- `Ctrl + M` : Open the shortcuts & debug menu
- `Esc` : Close any open modals
- `Ctrl + Enter` (in text area): Send reply AND automatically move to the next ticket
- `Enter` (in text area): Send reply only

## Product & UX Tradeoffs

1. **Strict Network Verification vs. Optimistic Updates:** On resolving a ticket, the UI intentionally waits for server confirmation rather than optimistically removing the ticket. For AI-escalated tickets with high customer friction (e.g. billing disputes or churn risks), an unconfirmed optimistic removal that silently fails on the network creates lost tickets or duplicate customer outreach.
2. **Auto-Advance Triage vs. Manual Navigation:** Resolving a ticket or sending a reply via `Ctrl + Enter` automatically advances agent focus to the next ticket in the queue. This prioritizes high-throughput queue clearing, assuming CX agents process escalated tickets sequentially.
3. **Actionable AI (Human-in-the-Loop) vs. Automated Bot Replies:** Suggested AI replies require a 1-click "Use" action rather than automated sending. Since these tickets were escalated precisely because an automated bot failed or confused the customer, human agent review before sending is strictly enforced.
4. **Focused Queue Views vs. Complex Filtering UI:** Scoped the primary navigation to "Inbox" (Action Required) and "Resolved" tabs, delegating tag/customer/content filtering to a quick search modal (`Ctrl + K`). This keeps the triage workspace clutter-free while leaving search fast and accessible.
5. **Keyboard-First Hotkeys vs. Touch Gestures:** Prioritized keyboard shortcuts (`Ctrl + .`, `Ctrl + ↓/↑`, `Ctrl + Enter`) for high-speed desktop triage. Mobile view is fully responsive, but touch-swipe gestures were deliberately deferred to focus on keyboard productivity.
6. **Debug Menu:** Added a debug menu to customise the error flow to help reviewers understand how the UI will respond on different reactions from the backend.

## Architecture & Technical Tradeoffs

- **Lightweight Queue Summaries vs. Heavy Ticket Detail Fetch:** The list pane fetches lightweight `TicketSummary` items (metadata, escalation reason, wait time), while heavy conversation logs, LTV, and AI summaries are fetched on-demand per ticket (`TicketDetail`). This ensures the inbox list renders instantaneously while keeping initial network payloads minimal.
- **Why MSW for Mocking?** Instead of hardcoding delays or hacking `setTimeout` in the API layer, MSW intercepts requests at the network level. This allowed building a "Debug Menu" (`Ctrl + M`) to simulate network latency, flaky connections, and 500 server errors on demand.
- **On-Demand Write Path Failure (TKT-3381):** Ticket `TKT-3381` ("Charan Chai") is explicitly configured in `db.ts` to fail on its first resolve attempt (returning a 500 error) and succeed on retry. This provides a deterministic on-demand write failure path for testing inline error recovery and UI feedback.
- **State Management & React Query:** Leveraged TanStack React Query v5 for server state caching, stale time management, and query invalidation. Centralized mutation handlers in `App.tsx` ensure consistent error handling, toasts, and auto-advance across both keyboard shortcuts and mouse clicks.

## Time Spent

- **Total Time:** ~2 evenings (~12 hours total) covering [Figma designs](https://www.figma.com/design/PdlEwFx5Ag6r0L5937b8Gk/Designs-Explore?node-id=2659-1567&t=cbUlWmiq8ehr2Egt-1), [Google Stitch designs](https://stitch.withgoogle.com/projects/6318458150133304811), architecture setup, MSW mocking, UI & accessibility polish, hotkey integration, and inline error recovery.
